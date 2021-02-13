import { BaseView } from "../../../modules/core/BaseView";
import { Rectangle } from "../../../modules/gameobjects/Rectangle";
import { ScreenUtilController } from "../../../modules/screenutility/ScreenUtilController";

export class BackgroundView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	private _sprite: Rectangle;

	constructor (private _scene: Phaser.Scene) {
		this.screenUtility = ScreenUtilController.getInstance();
		this.event = new Phaser.Events.EventEmitter();
	}

	get displayHeightRatio (): number {
		return this._sprite.transform.displayToOriginalHeightRatio;
	}

	create (): void {
		const { centerX, centerY, width, height } = this.screenUtility;
		this._sprite = new Rectangle(this._scene, centerX, centerY, 1080, 1920, 0xb2bec3, 1);
		this._sprite.transform.setMaxPreferredDisplaySize(width, height);
	}

}