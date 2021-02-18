import { CustomTypes } from "../../../../types/custom";
import { AnimationHelper } from "../../../helper/AnimationHelper";
import { Animations } from "../../../library/AssetAnimation";
import { Assets } from "../../../library/AssetGameplay";
import { BaseView } from "../../../modules/core/BaseView";
import { ArcadeSprite } from "../../../modules/gameobjects/ArcadeSprite";
import { ScreenUtilController } from "../../../modules/screenutility/ScreenUtilController";

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
};

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
		this._maxTimeToSpawn = 800;
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
		// const obstacleTypes = [
		// 	{
		// 		texture: Assets.obstacle_rockes.key,
		// 		speedRelative: 0,
		// 		interaction: () => {},
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
			const animationRockes = Animations.obstacle_rockes as CustomTypes.Asset.AnimationInfoType;
			AnimationHelper.AddAnimation(this._scene, animationRockes);
			gameObject.play(animationRockes.key);

			gameObject.on("pointerup", () => {
				let prevCounter: number = gameObject.getData(dataProps.counter) ?? 0;
				const tapToDestroy = 3;
				if (++prevCounter >= tapToDestroy) {
					gameObject.setData(dataProps.counter, 0);
					this.playParticle(gameObject);
					this.deactiveGameObject(gameObject);
					this.event.emit(EventNames.onPlaySFX, Assets.obstacle_rockes.key);
					return;
				}
				gameObject.setData(dataProps.counter, prevCounter);
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
				const calibratePosX = deltaPosX * 0.575; // 0 is easy to swipe, while 1 is hard to swipe
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

			gameObject.once("pointerup", () => {
				this.playParticle(gameObject);
				this.deactiveGameObject(gameObject);
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
		const SPEED_RELATIVE = -310;

		const obstacle = new ArcadeSprite(this._scene, 0, 0, assetType, 0);
		this._obstacleGroup.add(obstacle.gameObject);

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
	}

	private reuseObstacle (gameObject: Phaser.Physics.Arcade.Sprite): void {
		gameObject.setActive(true);
		gameObject.enableBody(false, 0, 0, true, true);

		const [left, right, top, bottom] = this._backgroundEdges;
		gameObject.setPosition(
			Phaser.Math.Between(left + (gameObject.displayWidth / 2), right - (gameObject.displayWidth / 2)),
			bottom + (gameObject.displayHeight / 2)
		);

		const displayPercentage = gameObject.getData(DataProps.displayPercentage) as number;
		const speedRelative =  this.updateSpeedRelative(gameObject, (gameObject.getData(DataProps.speedRelative) as number));
		
		gameObject.setVelocityY(speedRelative * displayPercentage);

		this.setInteractive(gameObject);
	}

	private initAdaptiveSpeedRelative (): void {
		const faster: CustomTypes.Gameplay.Obstacle.SpeedChanceType = { chance: 35, speed: -15 };
		const stay: CustomTypes.Gameplay.Obstacle.SpeedChanceType = { chance: 50, speed: 0};
		const slower: CustomTypes.Gameplay.Obstacle.SpeedChanceType = { chance: 15, speed: 5 };
		const chances = [faster, stay, slower];

		const chanceTotal = chances.reduce((val, acc) => {
			const reducer = { chance: val.chance + acc.chance, speed: 0 };
			return reducer;
		}).chance;

		this._chanceUpdateSpeedRelatives = chances.map((chanceSpeed, idx) => {
			if (idx === 0) {
				chanceSpeed.chance /= chanceTotal;
				return chanceSpeed;
			}

			chanceSpeed.chance = (chanceSpeed.chance / chanceTotal) + chances[idx-1].chance;
			return chanceSpeed;
		});
	}

	private updateSpeedRelative (gameObject: Phaser.Physics.Arcade.Sprite, prevSpeedRelative: number): number {
		const getChance = Math.random();
		const pickChance = this._chanceUpdateSpeedRelatives.find((target) => getChance <= target.chance)!;

		const speed = prevSpeedRelative + pickChance.speed;
		gameObject.setData(DataProps.speedRelative, speed);
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
		gameObject.setVelocity(0).disableBody(true, true);
		gameObject.removeAllListeners();
		gameObject.setActive(false);
	}

	create (displayPercentage: number, edges: number[]): void {
		this._obstacleGroup = this._scene.physics.add.group();
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
	}

}