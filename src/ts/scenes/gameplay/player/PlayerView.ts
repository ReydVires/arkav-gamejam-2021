import { CustomTypes } from "../../../../types/custom";
import { AnimationHelper } from "../../../helper/AnimationHelper";
import { Animations } from "../../../library/AssetAnimation";
import { Assets } from "../../../library/AssetGameplay";
import { BaseView } from "../../../modules/core/BaseView";
import { ArcadeSprite } from "../../../modules/gameobjects/ArcadeSprite";
import { ScreenUtilController } from "../../../modules/screenutility/ScreenUtilController";

const PLAYER_DEPTH = 20;

export const enum EventNames {
	onCreateFinish = "onCreateFinish",
	onDamaged = "onDamaged",
	onDead = "onDead",
}

export class PlayerView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	props = {
		life: 1,
		moveTimer: 5500,
	};

	private _sprite: ArcadeSprite;
	private _moveTimerRange: number[];
	private _moveArea: number[];

	constructor (private _scene: Phaser.Scene) {
		this.screenUtility = ScreenUtilController.getInstance();
		this.event = new Phaser.Events.EventEmitter();
	}

	get moveTimer (): number {
		const [min, max] = this._moveTimerRange;
		return Phaser.Math.Between(min, max);
	}

	create (displayPercentage: number, edges: number[]): void {
		const { centerX, height } = this.screenUtility;
		const [left, right, top, bottom] = edges;
		this._sprite = new ArcadeSprite(this._scene, 0, 0, Assets.player_raft_ride.key);
		this._sprite.transform.setToScaleDisplaySize(displayPercentage * 2);
		this._sprite.gameObject.setPosition(centerX, top + this._sprite.transform.displayHeight + (height * 0.175));
		this._sprite.gameObject.setDepth(PLAYER_DEPTH);

		const animInfoType = Animations.player_raft_ride as CustomTypes.Asset.AnimationInfoType;
		AnimationHelper.AddAnimation(this._scene, animInfoType);
		this._sprite.gameObject.play(animInfoType.key);

		this.initMoveComponent();
		this.event.emit(EventNames.onCreateFinish, this._sprite.gameObject);
	}

	private initMoveComponent (): void {
		this._moveTimerRange = [1000, 4000];
		this._moveArea = [
			this._sprite.gameObject.getLeftCenter().x,
			this._sprite.gameObject.getCenter().x,
			this._sprite.gameObject.getRightCenter().x,
		];
		// Unlock this for the uncertain difficulties
		// this._moveArea.unshift(this._sprite.gameObject.getLeftCenter().x * 0.85);
		// this._moveArea.push(this._sprite.gameObject.getRightCenter().x * 1.15);
	}

	movePlayerRandom (): void {
		const getTargetPosition = Math.floor(Math.random() * this._moveArea.length);
		const targetX = this._moveArea[getTargetPosition];
		if (targetX === this._sprite.gameObject.x) return; // Dont play tween if its still

		const playerMoveTween = this._scene.tweens.create({
			targets: this._sprite.gameObject,
			x: targetX,
			duration: 850,
		});
		playerMoveTween.play();
	}

	damaged (): void {
		this.props.life--;
		this._sprite.gameObject.disableBody(true);
		this._sprite.gameObject.setActive(true);

		const tweenProps = <Phaser.Types.Tweens.TweenPropConfig> {
			alpha: { getStart: () => 1, getEnd: () => 0.35 },
		};
		const tweenEffect = this._scene.tweens.create({
			targets: this._sprite.gameObject,
			props: tweenProps,
			duration: 60,
			yoyo: true,
			repeat: 3,
			completeDelay: 100,
			onComplete: () => {
				if (this.props.life <= 0) return;
				this._sprite.gameObject.enableBody(false, 0, 0, true, true);
			}
		});

		this.event.emit(EventNames.onDamaged, this.props.life);
		if (this.props.life <= 0) this.event.emit(EventNames.onDead);
		tweenEffect.play();
	}

	registerOverlap (target: Phaser.GameObjects.GameObject | Phaser.Physics.Arcade.Group, collideCallback: ArcadePhysicsCallback): Phaser.Physics.Arcade.Collider {
		return this._scene.physics.add.overlap(this._sprite.gameObject, target, collideCallback);
	}

}