import { CustomTypes } from "../../../../types/custom";
import { AnimationHelper } from "../../../helper/AnimationHelper";
import { Animations } from "../../../library/AssetAnimation";
import { Assets } from "../../../library/AssetGameplay";
import { BaseView } from "../../../modules/core/BaseView";
import { ArcadeSprite } from "../../../modules/gameobjects/ArcadeSprite";
import { ScreenUtilController } from "../../../modules/screenutility/ScreenUtilController";

const OBSTACLE_DEPTH = 25;

export const enum DataProps {
	deactiveThreshold = "deactiveThreshold",
	displayPercentage = "displayPercentage",
	assetType = "assetType",
	speedRelative = "speedRelative",
}

export const enum EventNames {
	onSpawn = "onSpawn",
	onTap = "onTap",
	onPlaySFX = "onPlaySFX",
	onCreateFinish = "onCreateFinish",
}

export class ObstacleView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	props = {
		timeToSpawn: 100
	};

	private _maxTimeToSpawn: number;
	private _backgroundEdges: number[];
	private _obstacleGroup: Phaser.Physics.Arcade.Group;
	private _emitter: Phaser.GameObjects.Particles.ParticleEmitter;
	private _chanceUpdateSpeedRelatives: CustomTypes.Gameplay.Obstacle.SpeedChanceType[];

	constructor (private _scene: Phaser.Scene) {
		this.screenUtility = ScreenUtilController.getInstance();
		this.event = new Phaser.Events.EventEmitter();
		this._maxTimeToSpawn = 1100; // 800
		this._backgroundEdges = [];
	}

	get obstacles (): Phaser.Physics.Arcade.Group {
		return this._obstacleGroup;
	}

	get maxTimeToSpawn (): number {
		return this._maxTimeToSpawn;
	}

	private getAssetTypeKey (): string {
		const assetKeys = [
			Assets.obstacle_rockes.key,
			Assets.obstacle_log.key,
			Assets.obstacle_trashes.key,
		];
		// TODO: Setup for futher development
		// const obstacleTypes: CustomTypes.Gameplay.Obstacle.Type[] = [
		// 	{
		// 		texture: Assets.obstacle_rockes.key,
		// 		speedRelative: 0,
		// 		handleInteraction: () => {},
		// 	},
		// ];
		const randomPick = Math.floor(Math.random() * assetKeys.length);
		return assetKeys[randomPick];
	}

	private setInteractive (gameObject: Phaser.Physics.Arcade.Sprite): void {
		gameObject.setInteractive({ useHandCursor: true });

		const dataProps = {
			counter: "counter",
			prevPosX: "prevPosX"
		};

		const assetType = gameObject.getData(DataProps.assetType) as string;
		switch (assetType) {
		case Assets.obstacle_rockes.key:
			gameObject.setData(dataProps.counter, 0); // Reset tap counter

			const animationRockes = Animations.obstacle_rockes as CustomTypes.Asset.AnimationInfoType;
			AnimationHelper.AddAnimation(this._scene, animationRockes);
			gameObject.play(animationRockes.key);

			const animData = [
				Animations.obstacle_rock_tap_destroy, // On destroy anim
				Animations.obstacle_rock_tap_destroy2,
				Animations.obstacle_rockes_2, // After destroy anim
				Animations.obstacle_rockes_3,
			];

			const animationRockDestroy = Animations.obstacle_rockes_destroy as CustomTypes.Asset.AnimationInfoType;
			const onAnimRockDestroy = AnimationHelper.AddAnimation(this._scene, animationRockDestroy) as Phaser.Animations.Animation;
			gameObject.once("animationcomplete-" + animationRockDestroy.key, () => {
				this.deactiveGameObject(gameObject);
			});

			gameObject.on("pointerup", () => {
				let prevCounter: number = gameObject.getData(dataProps.counter) ?? 0;
				const tapToDestroy = 3;
				if (++prevCounter >= tapToDestroy) {
					gameObject.disableInteractive();
					this.event.emit(EventNames.onPlaySFX, Assets.obstacle_rockes.key);

					onAnimRockDestroy.once(Phaser.Animations.Events.ANIMATION_START, () => {
						gameObject.setVelocityY(0);
						gameObject.disableBody(true, false);
						gameObject.setActive(true);
					});
					gameObject.play(animationRockDestroy.key);
					return;
				}
				gameObject.setData(dataProps.counter, prevCounter);
				this.event.emit(EventNames.onPlaySFX, Assets.obstacle_rockes.key + "_" + prevCounter);

				const animIndex = prevCounter - 1;
				const animDestroyRockes = animData[animIndex] as CustomTypes.Asset.AnimationInfoType;
				const animAfterRockes = animData[animIndex + 2] as CustomTypes.Asset.AnimationInfoType;

				const onAnimRockPlay = AnimationHelper.AddAnimation(this._scene, animDestroyRockes) as Phaser.Animations.Animation;
				AnimationHelper.AddAnimation(this._scene, animAfterRockes) as Phaser.Animations.Animation;

				onAnimRockPlay.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
					gameObject.play(animAfterRockes.key);
				});

				gameObject.play(animDestroyRockes.key);
			});
			break;
		case Assets.obstacle_log.key:
			const inputPlugin = this._scene.input;
			inputPlugin.setDraggable(gameObject);
			inputPlugin.dragDistanceThreshold = 32 * gameObject.getData(DataProps.displayPercentage);

			const animationLog = Animations.obstacle_log as CustomTypes.Asset.AnimationInfoType;
			AnimationHelper.AddAnimation(this._scene, animationLog);
			gameObject.play(animationLog.key);

			gameObject.on("dragstart", () => {
				this.event.emit(EventNames.onPlaySFX, Assets.obstacle_log.key);
				gameObject.setData(dataProps.prevPosX, gameObject.x);
			});
			gameObject.on("drag", (p: Phaser.Input.Pointer, dragX: number) => {
				const deltaPosX = dragX - (gameObject.getData(dataProps.prevPosX) as number);
				const calibratePosX = deltaPosX * (0.615); // 0 is easy to swipe, while 1 is hard to swipe
				const getDragX = dragX - calibratePosX;

				const [left, right] = this._backgroundEdges;
				const edge = gameObject.displayWidth / 2;
				const isOnRiverside = (getDragX - edge < left) || (getDragX + edge > right);
				if (isOnRiverside) return;

				gameObject.x = getDragX;
			});
			break;
		case Assets.obstacle_trashes.key:
			const animationTrashes = Animations.obstacle_trashes as CustomTypes.Asset.AnimationInfoType;
			AnimationHelper.AddAnimation(this._scene, animationTrashes);
			gameObject.play(animationTrashes.key);

			const animationTrashesDrown = Animations.obstacle_trashes_drown as CustomTypes.Asset.AnimationInfoType;
			const onAnimTrashDrown = AnimationHelper.AddAnimation(this._scene, animationTrashesDrown) as Phaser.Animations.Animation;

			gameObject.once("animationcomplete-" + animationTrashesDrown.key, () => {
				this.deactiveGameObject(gameObject);
			});
			gameObject.once("pointerup", () => {
				onAnimTrashDrown.once(Phaser.Animations.Events.ANIMATION_START, () => {
					gameObject.body.checkCollision.none = true;
					gameObject.setVelocityY(gameObject.body.velocity.y * 0.65); // Slower
				});
				onAnimTrashDrown.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
					gameObject.disableBody(true, false);
					gameObject.body.checkCollision.none = false;
				});
				gameObject.play(Animations.obstacle_trashes_drown.key);
				this.event.emit(EventNames.onPlaySFX, Assets.obstacle_trashes.key);
			});
			break;
		default:
			// None of them
			break;
		}
	}

	private spawnObstacle (displayPercentage: number, assetType: string): void {
		const [leftEdge, rightEdge] = this._backgroundEdges;
		const spawnPosY = this.screenUtility.height;
		const SPEED_RELATIVE = -100; // -310

		const obstacle = new ArcadeSprite(this._scene, 0, 0, assetType, 0);
		this._obstacleGroup.add(obstacle.gameObject);
		obstacle.gameObject.setDepth(OBSTACLE_DEPTH);

		obstacle.transform.setToScaleDisplaySize(displayPercentage);
		obstacle.gameObject.setData(DataProps.assetType, assetType);
		obstacle.gameObject.setData(DataProps.displayPercentage, displayPercentage);
		obstacle.gameObject.setData(DataProps.deactiveThreshold, -obstacle.transform.displayHeight);
		obstacle.gameObject.setData(DataProps.speedRelative, SPEED_RELATIVE);

		obstacle.gameObject.setPosition(
			Phaser.Math.Between(leftEdge + (obstacle.transform.displayWidth / 2), rightEdge - (obstacle.transform.displayWidth / 2)),
			spawnPosY + (obstacle.transform.displayHeight / 2)
		);
		obstacle.gameObject.setVelocityY(SPEED_RELATIVE * displayPercentage);

		this.setInteractive(obstacle.gameObject);
		this.event.emit(EventNames.onCreateFinish, obstacle.gameObject);
	}

	private reuseObstacle (gameObject: Phaser.Physics.Arcade.Sprite): void {
		gameObject.setActive(true);
		gameObject.enableBody(false, 0, 0, true, true);
		gameObject.setDepth(OBSTACLE_DEPTH); // Refresh depth

		const [left, right, top, bottom] = this._backgroundEdges;
		gameObject.setPosition(
			Phaser.Math.Between(left + (gameObject.displayWidth / 2), right - (gameObject.displayWidth / 2)),
			bottom + (gameObject.displayHeight / 2)
		);

		const displayPercentage = gameObject.getData(DataProps.displayPercentage) as number;
		const speedRelative =  this.updateSpeedRelative(gameObject.getData(DataProps.speedRelative) as number);
		gameObject.setData(DataProps.speedRelative, speedRelative);
		gameObject.setVelocityY(speedRelative * displayPercentage);

		this.setInteractive(gameObject);
	}

	private initAdaptiveSpeedRelative (): void {
		const faster: CustomTypes.Gameplay.Obstacle.SpeedChanceType = { chance: 50, speed: -15 };
		const stay: CustomTypes.Gameplay.Obstacle.SpeedChanceType = { chance: 40, speed: 0};
		const slower: CustomTypes.Gameplay.Obstacle.SpeedChanceType = { chance: 10, speed: 5 };
		const chances = [faster, stay, slower];

		const chanceTotal = chances.reduce((val, acc) => {
			const reducer = { chance: val.chance + acc.chance, speed: 0 } as CustomTypes.Gameplay.Obstacle.SpeedChanceType;
			return reducer;
		}).chance;

		this._chanceUpdateSpeedRelatives = chances.map((chanceSpeed, idx) => {
			chanceSpeed.chance /= chanceTotal;
			if (idx === 0) return chanceSpeed;

			const prevIdx = idx-1;
			chanceSpeed.chance += chances[prevIdx].chance;
			return chanceSpeed;
		});
	}

	private updateSpeedRelative (prevSpeedRelative: number): number {
		const getChance = Math.random();
		const pickChance = this._chanceUpdateSpeedRelatives.find((target) => getChance <= target.chance)!;
		const speed = prevSpeedRelative + pickChance.speed;
		return speed;
	}

	private createParticleEmitter (): void {
		this._emitter = this._scene.add.particles(Assets.white_effect.key).createEmitter({
			scale: { start: 1, end: 0 },
			speed: { min: 0, max: 240 },
			angle: 270,
			gravityY: -98,
			active: false,
			lifespan: 550,
			quantity: 50
		});
	}

	private playParticle (gameObject: Phaser.Physics.Arcade.Sprite): void {
		const { displayWidth: width, displayHeight: height } = gameObject;
		const { x, y } = gameObject.getTopLeft();
		const ratio = gameObject.getData(DataProps.displayPercentage) as number;
		const count = 45 * ratio;

		this._emitter.active = true;
		this._emitter.setEmitZone({
			source: new Phaser.Geom.Rectangle(0, 0, (width), (height)),
			quantity: count,
			type: "random"
		});
		this._emitter.explode(count, x, y);
	}

	deactiveGameObject (gameObject: Phaser.Physics.Arcade.Sprite): void {
		gameObject.setDepth(0);
		gameObject.setVelocity(0).disableBody(true, true);
		gameObject.setActive(false);
		gameObject.removeAllListeners();
	}

	create (displayPercentage: number, edges: number[]): void {
		this._obstacleGroup = this._scene.physics.add.group().setDepth(OBSTACLE_DEPTH);
		this._backgroundEdges = edges;
		this.createParticleEmitter();
		this.initAdaptiveSpeedRelative();
		this.event.on(EventNames.onSpawn, () => {
			const assetType = this.getAssetTypeKey();
			const obstacle = this._obstacleGroup.getChildren()
				.find((obstacle) => !obstacle.active && (obstacle.getData(DataProps.assetType) === assetType));
			if (obstacle) {
				this.reuseObstacle(obstacle as Phaser.Physics.Arcade.Sprite);
				return;
			}
			this.spawnObstacle(displayPercentage, assetType);
		});

		// Make obstacles collider each other
		this._scene.physics.add.collider(this._obstacleGroup, this._obstacleGroup);
	}

}