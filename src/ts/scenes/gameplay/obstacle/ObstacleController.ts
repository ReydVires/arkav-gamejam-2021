import { DataProps, EventNames, ObstacleView } from "./ObstacleView";

type OnPlaySFX = (type: string) => void;

export class ObstacleController {

	private _view: ObstacleView;

	constructor (scene: Phaser.Scene) {
		this._view = new ObstacleView(scene);
	}

	init (displayPercentage: number, edges: number[]): void {
		this._view.create(displayPercentage, edges);
	}

	private resetTimeToSpawn (): void {
		this._view.props.timeToSpawn += this._view.maxTimeToSpawn;
	}

	deactiveObstacle (gameObject: Phaser.GameObjects.GameObject): void {
		this._view.deactiveGameObject(gameObject as Phaser.Physics.Arcade.Sprite);
	}

	obstacles (): Phaser.Physics.Arcade.Group {
		return this._view.obstacles;
	}

	update (time: number, dt: number): void {
		this._view.obstacles.getChildren().forEach((obstacle) => {
			const gameObject = obstacle as Phaser.Physics.Arcade.Sprite;
			if (gameObject.active) {
				const deactiveThreshold = gameObject.getData(DataProps.deactiveThreshold) as number;
				if (gameObject.y < deactiveThreshold) this.deactiveObstacle(gameObject);
			}
		});

		const timeLoss = dt * 0.5;
		this._view.props.timeToSpawn -= timeLoss;
		if (this._view.props.timeToSpawn <= 0) {
			this._view.event.emit(EventNames.onSpawn);
			this.resetTimeToSpawn();
		}
	}

	onPlaySFX (events: OnPlaySFX): void {
		this._view.event.on(EventNames.onPlaySFX, events);
	}

}