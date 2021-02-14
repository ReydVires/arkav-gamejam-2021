import { EventNames, PlayerView } from "./PlayerView";

type OnDamaged = (life: number) => void;

export class PlayerController {

	private _view: PlayerView;
	private _healthBonusStatus: boolean = false;

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

	update (time: number, dt: number): void {}

	onDamaged (events: OnDamaged): void {
		this._view.event.on(EventNames.onDamaged, events);
	}

	healthBonus(): void {
		if(!this.getHealthBonusActive()){
			this._view.props.life += 1;
			this.setHealthBonusActive(true);
			console.log('masuk ke health bonus status false, health udah nambah', this._view.props.life)
		}
		// animasi nambah health/tameng di view
	}
	getHealthBonusActive(): boolean {
		if(this._view.props.life = 1){
			console.log('masuk ke health bonus status true, health enggak nambah')
			this.setHealthBonusActive(false);
		}
		return this._healthBonusStatus;
	}
	setHealthBonusActive(status: boolean): void {
		console.log('masuk ke set bonus', status);
		this._healthBonusStatus = status;
	}
}