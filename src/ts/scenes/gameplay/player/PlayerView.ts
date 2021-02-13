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

	create (displayPercentage: number, edges: number[]): void {
		const { centerX, height } = this.screenUtility;
		const [left, right, top, bottom] = edges;
		this._sprite = new ArcadeSprite(this._scene, 0, 0, Assets.player_raft.key, 0);
		this._sprite.transform.setToScaleDisplaySize(displayPercentage);
		this._sprite.gameObject.setPosition(centerX, top + this._sprite.transform.displayHeight + (height * 0.15));
	}

}