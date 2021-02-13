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
	private _obstacleSprites: Phaser.Physics.Arcade.Sprite[];

	constructor (private _scene: Phaser.Scene) {
		this.screenUtility = ScreenUtilController.getInstance();
		this.event = new Phaser.Events.EventEmitter();
		this._maxTimeToSpawn = 1000;
		this._obstacleSprites = [];
	}

	get obstacles (): Phaser.Physics.Arcade.Sprite[] {
		return this._obstacleSprites;
	}

	get maxTimeToSpawn (): number {
		return this._maxTimeToSpawn;
	}

	private getAssetTypeKey (): string {
		const assetKeys = [ // TODO: Define with object data property
			Assets.obs_boulder.key,
			Assets.obs_plank.key,
			Assets.obs_sharp.key,
		];
		const randomPick = Math.floor(Math.random() * assetKeys.length);
		return assetKeys[randomPick];
	}

	private setInteractive (gameObject: Phaser.Physics.Arcade.Sprite): void {
		gameObject.setInteractive({ useHandCursor: true });

		const assetType = gameObject.getData(DataProps.assetType) as string;
		const dataProps = {
			counter: "counter"
		};
		switch (assetType) {
		case Assets.obs_boulder.key:
			gameObject.on("pointerup", () => {
				let prevCounter: number = gameObject.getData(dataProps.counter) ?? 0;
				if (++prevCounter >= 2) {
					gameObject.setData(dataProps.counter, 0);
					this.deactiveGameObject(gameObject);
					return;
				}
				gameObject.setData(dataProps.counter, prevCounter);
			});
			break;
		case Assets.obs_plank.key:
			const inputPlugin = this._scene.input;
			inputPlugin.setDraggable(gameObject);
			inputPlugin.dragDistanceThreshold = 32 * gameObject.getData(DataProps.displayPercentage);

			gameObject.on("dragstart", () => gameObject.setVelocity(0));
			gameObject.on("drag", (p: Phaser.Input.Pointer) => {
				gameObject.x = p.x;
			});
			gameObject.on("dragend", () => this.deactiveGameObject(gameObject));
			break;
		default:
			gameObject.once("pointerup", () => {
				// TODO: Play particle
				this.deactiveGameObject(gameObject);
			});
			break;
		}
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

		this.setInteractive(obstacle.gameObject);

		this._obstacleSprites.push(obstacle.gameObject);
	}

	private reuseObstacle (gameObject: Phaser.Physics.Arcade.Sprite): void {
		gameObject.setActive(true);
		gameObject.enableBody(false, 0, 0, true, true);

		const [left, right, top, bottom] = gameObject.getData(DataProps.backgroundEdges) as number[];
		gameObject.setPosition(
			Phaser.Math.Between(left + (gameObject.displayWidth / 2), right - (gameObject.displayWidth / 2)),
			bottom + (gameObject.displayHeight / 2)
		);

		const speedRelative = -190;
		const displayPercentage = gameObject.getData(DataProps.displayPercentage) as number;
		gameObject.setVelocityY(speedRelative * displayPercentage);

		this.setInteractive(gameObject);
	}

	deactiveGameObject (gameObject: Phaser.Physics.Arcade.Sprite): void {
		gameObject.setVelocity(0).disableBody(true, true);
		gameObject.removeAllListeners();
		gameObject.setActive(false);
	}

	create (displayPercentage: number, edges: number[]): void {
		this.event.on(EventNames.onSpawn, () => {
			const assetType = this.getAssetTypeKey();
			const obstacle = this._obstacleSprites.find((obstacle) => !obstacle.active && (obstacle.getData(DataProps.assetType) === assetType));
			if (obstacle) {
				this.reuseObstacle(obstacle);
				return;
			}
			this.spawnObstacle(displayPercentage, edges, assetType);
		});
	}

}