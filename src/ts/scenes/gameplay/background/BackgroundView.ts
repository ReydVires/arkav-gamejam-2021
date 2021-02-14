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

	get getEdge (): number [] {
		return [
			this._sprite.gameObject.getLeftCenter().x,
			this._sprite.gameObject.getRightCenter().x,
			this._sprite.gameObject.getTopCenter().y,
			this._sprite.gameObject.getBottomCenter().y,
		];
	}

	create (): void {
		const { centerX, centerY, width, height } = this.screenUtility;
		const color = 0x74b9ff;
		this._sprite = new Rectangle(this._scene, centerX, centerY, 1080, 1920, color, 1);
		this._sprite.transform.setMaxPreferredDisplaySize(width, height);
	}

}