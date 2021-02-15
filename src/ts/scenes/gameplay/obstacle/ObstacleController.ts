import { DataProps, EventNames, ObstacleView } from "./ObstacleView";

type OnDestroy = (type: string) => void;

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

	deactiveObstacle (gameObject: Phaser.GameObjects.GameObject, playerDo: boolean): void {
		this._view.deactiveGameObject(gameObject as Phaser.Physics.Arcade.Sprite, false);
	}

	obstacles (): Phaser.Physics.Arcade.Group {
		return this._view.obstacles;
	}

	getDeactivatedBonus (): boolean {
		return this._view.deactivatedBonus;
	}
	
	setDeactivatedBonus (status: boolean): void {
		this._view.deactivatedBonus = status;
	}

	update (time: number, dt: number): void {
		this._view.obstacles.getChildren().forEach((obstacle) => {
			const gameObject = obstacle as Phaser.Physics.Arcade.Sprite;
			if (gameObject.active) {
				const deactiveThreshold = gameObject.getData(DataProps.deactiveThreshold) as number;
				if (gameObject.y < deactiveThreshold) this.deactiveObstacle(gameObject, false);
			}
		});
		
		const timeLoss = dt * 0.5;
		this._view.props.timeToSpawn -= timeLoss;
		if (this._view.props.timeToSpawn <= 0) {
			this._view.event.emit(EventNames.onSpawn);
			this.resetTimeToSpawn();
		}

		if(this._view.obsHoldCondition){
			this._view.obsHoldCounter += 1;
			console.log('controller', this._view.obsHoldCounter);

			// become bigger
			// sprite tinted light green and lighter  
		}
	}

	onDestroy (events: OnDestroy): void {
		this._view.event.on(EventNames.onDestroy, events);
	}

}