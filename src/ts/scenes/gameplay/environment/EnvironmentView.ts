import { CustomTypes } from "../../../../types/custom";
import { AnimationHelper } from "../../../helper/AnimationHelper";
import { Animations } from "../../../library/AssetAnimation";
import { Assets } from "../../../library/AssetGameplay";
import { BaseView } from "../../../modules/core/BaseView";
import { Sprite } from "../../../modules/gameobjects/Sprite";
import { ScreenUtilController } from "../../../modules/screenutility/ScreenUtilController";

const ENV_DEPTH = 30;

export const enum DataProps {
	originalEdgePos = "originalEdgePos",
	disableEdgePos = "disableEdgePos",
	speed = "speed",
	syncSpeedY = "syncSpeedY",
	sourceSide = "sourceSide",
}

export const enum EventNames {
	onSpawn = "onSpawn",
	onDeactive = "onDeactive",
}

export class EnvironmentView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	props = {
		timeToSpawn: 3000,
	};

	private _environmentGroup: Phaser.GameObjects.Group;

	constructor (private _scene: Phaser.Scene) {
		this.screenUtility = ScreenUtilController.getInstance();
		this.event = new Phaser.Events.EventEmitter();
	}

	get environmentGroup (): Phaser.GameObjects.Group {
		return this._environmentGroup;
	}

	get randomPosY (): number {
		const { height } = this.screenUtility;
		return Phaser.Math.Between(height * 0.2, height * 0.95);
	}

	get maxTimeToSpawn (): number {
		return Phaser.Math.Between(4500, 8000);
	}

	private rotation (isLeft: boolean): number[] {
		// Rotation and sync speed Y
		const rotations = [
			[isLeft ? (Math.PI / 2) : (Math.PI * 1.5), 0.35],
			[isLeft ? (Math.PI / 4) : (Math.PI * 1.75), 1]
		];
		const randomPick = Math.random() > 0.5 ? 0 : 1;
		return rotations[randomPick];
	}

	private spawnEnvironment (displayPercentage: number, sourceSideFomLeft: boolean): void {
		const animBird = Animations.bird_silhouette as CustomTypes.Asset.AnimationInfoType;
		AnimationHelper.AddAnimation(this._scene, animBird);

		const { width } = this.screenUtility;
		const [birdSyncRotation, birdSyncSpeed] = this.rotation(sourceSideFomLeft);

		const bird = new Sprite(this._scene, sourceSideFomLeft ? 0 : width, this.randomPosY, Assets.bird_silhouette.key);
		bird.transform.setToScaleDisplaySize(displayPercentage * Phaser.Math.FloatBetween(0.5, 0.8));
		bird.gameObject.x += bird.transform.displayWidth / 2 * (sourceSideFomLeft ? -1 : 1) ;
		bird.gameObject.setAlpha(0.65);
		bird.gameObject.setRotation(birdSyncRotation);
		bird.gameObject.setDepth(ENV_DEPTH);

		bird.gameObject.setData(DataProps.originalEdgePos, bird.gameObject.x);
		bird.gameObject.setData(DataProps.sourceSide, sourceSideFomLeft);
		bird.gameObject.setData(DataProps.disableEdgePos, [
			(bird.transform.displayWidth / 2) * (sourceSideFomLeft ? -1 : 1),
			sourceSideFomLeft ? width : -(bird.transform.displayWidth / 2)
		]);
		bird.gameObject.setData(DataProps.speed, (32 * displayPercentage) * (sourceSideFomLeft ? 1 : -1));
		bird.gameObject.setData(DataProps.syncSpeedY, birdSyncSpeed);

		bird.gameObject.play(animBird.key);

		this._environmentGroup.add(bird.gameObject);
	}

	private reuseEnvironment (gameObject: Phaser.GameObjects.Sprite): void {
		const sourceSide = gameObject.getData(DataProps.sourceSide);
		const [birdSyncRotation, birdSyncSpeed] = this.rotation(sourceSide);
		const sourceX = gameObject.getData(DataProps.originalEdgePos) as number;

		gameObject.setActive(true).setVisible(true);
		gameObject.setData(DataProps.syncSpeedY, birdSyncSpeed);
		gameObject.setRotation(birdSyncRotation);
		gameObject.setPosition(sourceX, this.randomPosY);
	}

	create (displayPercentage: number): void {
		this._environmentGroup = this._scene.add.group().setDepth(ENV_DEPTH);

		this.event.on(EventNames.onSpawn, (side: boolean) => {
			const envObject = this._environmentGroup.getChildren()
				.find((envObject) => !envObject.active && (envObject.getData(DataProps.sourceSide) === side));
			if (envObject) {
				this.reuseEnvironment(envObject as Phaser.GameObjects.Sprite);
				return;
			}
			this.spawnEnvironment(displayPercentage, side);
		});

		this.event.on(EventNames.onDeactive, (gameObject: Phaser.GameObjects.Sprite) => {
			gameObject.setActive(false).setVisible(false);
		});
	}

}