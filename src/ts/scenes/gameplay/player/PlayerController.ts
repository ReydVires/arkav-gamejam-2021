import { EventNames, PlayerView } from "./PlayerView";

type OnDamaged = (life: number) => void;

export class PlayerController {

	private _view: PlayerView;

	constructor (scene: Phaser.Scene) {
		this._view = new PlayerView(scene);
	}

	init (displayPercentage: number, edges: number[]): void {
		this._view.create(displayPercentage, edges);
	}

	registerOverlap (target: Phaser.GameObjects.GameObject | Phaser.Physics.Arcade.Group, collideCallback: ArcadePhysicsCallback): void {
		this._view.registerOverlap(target, collideCallback);
	}

	damaged (): void {
		this._view.damaged();
	}

	position (): Phaser.Math.Vector2 {
		return this._view.position;
	}

	update (time: number, dt: number): void {}

	onDamaged (events: OnDamaged): void {
		this._view.event.on(EventNames.onDamaged, events);
	}

}