import { Assets } from "../../../library/AssetGameplay";
import { BaseView } from "../../../modules/core/BaseView";
import { ArcadeSprite } from "../../../modules/gameobjects/ArcadeSprite";
import { ScreenUtilController } from "../../../modules/screenutility/ScreenUtilController";

export class PlayerView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	private _sprite: ArcadeSprite;

	constructor (private _scene: Phaser.Scene) {
		this.screenUtility = ScreenUtilController.getInstance();
		this.event = new Phaser.Events.EventEmitter();
	}

	create (displayPercentage: number): void {
		const { centerX, centerY } = this.screenUtility;
		this._sprite = new ArcadeSprite(this._scene, centerX, (centerY * 0.25), Assets.player_raft.key, 0);
		this._sprite.transform.setToScaleDisplaySize(displayPercentage);
	}

}