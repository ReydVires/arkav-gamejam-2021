import { CustomTypes } from "../../../../types/custom";
import { AnimationHelper } from "../../../helper/AnimationHelper";
import { Animations } from "../../../library/AssetAnimation";
import { Assets } from "../../../library/AssetGameplay";
import { BaseView } from "../../../modules/core/BaseView";
import { ArcadeSprite } from "../../../modules/gameobjects/ArcadeSprite";
import { ScreenUtilController } from "../../../modules/screenutility/ScreenUtilController";

const PLAYER_LAYER = 20;

export const enum EventNames {
	onCreateFinish = "onCreateFinish",
	onDamaged = "onDamaged",
};

export class PlayerView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	props = {
		life: 1,
	};

	private _sprite: ArcadeSprite;

	constructor (private _scene: Phaser.Scene) {
		this.screenUtility = ScreenUtilController.getInstance();
		this.event = new Phaser.Events.EventEmitter();
	}

	create (displayPercentage: number, edges: number[]): void {
		const { centerX, height } = this.screenUtility;
		const [left, right, top, bottom] = edges;
		this._sprite = new ArcadeSprite(this._scene, 0, 0, Assets.player_raft_ride.key);
		this._sprite.transform.setToScaleDisplaySize(displayPercentage * 2);
		this._sprite.gameObject.setPosition(centerX, top + this._sprite.transform.displayHeight + (height * 0.175));
		this._sprite.gameObject.setDepth(PLAYER_LAYER);

		const animInfoType = Animations.player_raft_ride as CustomTypes.Asset.AnimationInfoType;
		AnimationHelper.AddAnimation(this._scene, animInfoType);
		this._sprite.gameObject.play(animInfoType.key);
	}

	damaged (): void {
		this.props.life--;
		this._sprite.gameObject.disableBody(true, false);

		const tweenProps = <Phaser.Types.Tweens.TweenPropConfig> {
			alpha: { getStart: () => 1, getEnd: () => 0.35 },
		};
		const tweenEffect = this._scene.tweens.create({
			targets: this._sprite.gameObject,
			props: tweenProps,
			duration: 75,
			yoyo: true,
			repeat: 2,
			completeDelay: 100,
			onComplete: () => {
				if (this.props.life <= 0) return;
				this._sprite.gameObject.enableBody(false, 0, 0, true, true);
			}
		});
		this.event.emit(EventNames.onDamaged, this.props.life);
		tweenEffect.play();
	}

	registerOverlap (target: Phaser.GameObjects.GameObject | Phaser.Physics.Arcade.Group, collideCallback: ArcadePhysicsCallback): void {
		this._scene.physics.add.overlap(this._sprite.gameObject, target, collideCallback);
	}

}