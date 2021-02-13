import { Assets } from "../../../library/AssetGameplay";
import { BaseView } from "../../../modules/core/BaseView";
import { ArcadeSprite } from "../../../modules/gameobjects/ArcadeSprite";
import { ScreenUtilController } from "../../../modules/screenutility/ScreenUtilController";

export const enum DataProps {
	deactiveThreshold = "deactiveThreshold",
	displayPercentage = "displayPercentage",
	backgroundEdges = "backgroundEdges",
	assetType = "assetType",
}

export const enum EventNames {
	onSpawn = "onSpawn",
};

export class ObstacleView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	props = {
		timeToSpawn: 1000
	};

	private _maxTimeToSpawn: number;
	private _obstacleSprites: ArcadeSprite[];

	constructor (private _scene: Phaser.Scene) {
		this.screenUtility = ScreenUtilController.getInstance();
		this.event = new Phaser.Events.EventEmitter();
		this._maxTimeToSpawn = 1000;
		this._obstacleSprites = [];
	}

	get obstacles (): ArcadeSprite[] {
		return this._obstacleSprites;
	}

	get maxTimeToSpawn (): number {
		return this._maxTimeToSpawn;
	}

	private getAssetTypeKey (): string {
		const assetKeys = [
			Assets.obs_boulder.key,
			Assets.obs_plank.key,
			Assets.obs_sharp.key,
		];
		const randomPick = Math.floor(Math.random() * assetKeys.length);
		return assetKeys[randomPick];
	}

	private spawnObstacle (displayPercentage: number, edges: number[], assetType: string): void {
		const [leftEdge, rightEdge, topEdge, bottomEdge] = edges;
		const spawnPosY = bottomEdge;
		const speedRelative = -190;

		const obstacle = new ArcadeSprite(this._scene, 0, 0, assetType, 0);
		obstacle.transform.setToScaleDisplaySize(displayPercentage);
		obstacle.gameObject.setData(DataProps.assetType, assetType);
		obstacle.gameObject.setData(DataProps.displayPercentage, displayPercentage);
		obstacle.gameObject.setData(DataProps.backgroundEdges, edges);
		obstacle.gameObject.setData(DataProps.deactiveThreshold, topEdge - (obstacle.transform.displayHeight / 2));

		obstacle.gameObject.setPosition(
			Phaser.Math.Between(leftEdge + (obstacle.transform.displayWidth / 2), rightEdge - (obstacle.transform.displayWidth / 2)),
			spawnPosY + (obstacle.transform.displayHeight / 2)
		);
		obstacle.gameObject.setVelocityY(speedRelative * displayPercentage);

		this._obstacleSprites.push(obstacle);
	}

	reuseObstacle (obstacle: ArcadeSprite): void {
		obstacle.gameObject.setActive(true);
		obstacle.gameObject.enableBody(false, 0, 0, true, true);

		const displayPercentage = obstacle.gameObject.getData(DataProps.displayPercentage) as number;
		obstacle.transform.setToScaleDisplaySize(displayPercentage);

		const [left, right, top, bottom] = obstacle.gameObject.getData(DataProps.backgroundEdges) as number[];
		obstacle.gameObject.setPosition(
			Phaser.Math.Between(left + (obstacle.transform.displayWidth / 2), right - (obstacle.transform.displayWidth / 2)),
			bottom + (obstacle.transform.displayHeight / 2)
		);

		const speedRelative = -190;
		obstacle.gameObject.setVelocityY(speedRelative * displayPercentage);
	}

	deactiveObstacle (gameObject: Phaser.Physics.Arcade.Sprite): void {
		gameObject.setVelocity(0).disableBody(true, true);
		gameObject.setActive(false);
	}

	create (displayPercentage: number, edges: number[]): void {
		this.event.on(EventNames.onSpawn, () => {
			const assetType = this.getAssetTypeKey();
			const obstacle = this._obstacleSprites.find((obstacle) => !obstacle.gameObject.active && (obstacle.gameObject.getData(DataProps.assetType) === assetType));
			if (obstacle) {
				this.reuseObstacle(obstacle);
				return;
			}
			this.spawnObstacle(displayPercentage, edges, assetType);
		});
	}

}