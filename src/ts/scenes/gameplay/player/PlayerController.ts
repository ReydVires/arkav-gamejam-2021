import { EventNames, PlayerView } from "./PlayerView";

type OnDamaged = (life: number) => void
type OnCreateFinish = (gameObject: Phaser.Physics.Arcade.Sprite) => void

export class PlayerController {

	private _view: PlayerView;

	constructor (scene: Phaser.Scene) {
		this._view = new PlayerView(scene);
	}

	init (displayPercentage: number, edges: number[]): void {
		this._view.create(displayPercentage, edges);
	}

	registerOverlap (target: Phaser.GameObjects.GameObject | Phaser.Physics.Arcade.Group, collideCallback: ArcadePhysicsCallback): Phaser.Physics.Arcade.Collider {
		return this._view.registerOverlap(target, collideCallback);
	}

	damaged (): void {
		this._view.damaged();
	}

	private resetMoveTime (): void {
		this._view.props.moveTimer += this._view.moveTimer;
	}

	update (time: number, dt: number): void {
		const timeLoss = dt * 0.125;
		this._view.props.moveTimer -= timeLoss;
		if (this._view.props.moveTimer <= 0) {
			this._view.movePlayerRandom();
			this.resetMoveTime();
		}
	}

	onDamaged (events: OnDamaged): void {
		this._view.event.on(EventNames.onDamaged, events);
	}

	onDead (events: Function): void {
		this._view.event.once(EventNames.onDead, events);
	}

	onCreateFinish (events: OnCreateFinish): void {
		this._view.event.once(EventNames.onCreateFinish, events);
	}

}