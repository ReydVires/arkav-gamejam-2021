import { Assets } from "../../../library/AssetGameplay";
import { BaseView } from "../../../modules/core/BaseView";
import { Image } from "../../../modules/gameobjects/Image";
import { Rectangle } from "../../../modules/gameobjects/Rectangle";
import { ScreenUtilController } from "../../../modules/screenutility/ScreenUtilController";

const RIVERSIDE_DEPTH = 26;

export const enum EventNames {
	onUpdateSpeedResistance = "onUpdateSpeedResistance",
	onCreateFinish = "onCreateFinish",
}

export class BackgroundView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	props = {
		speedResistance: 3,
	}

	private _sprite: Rectangle;
	private _backgrounds: Image[];
	private _riversideWidth: number;

	constructor (private _scene: Phaser.Scene) {
		this.screenUtility = ScreenUtilController.getInstance();
		this.event = new Phaser.Events.EventEmitter();
		this._backgrounds = [];
	}

	get displayHeightRatio (): number {
		return this._sprite.transform.displayToOriginalHeightRatio;
	}

	get backgrounds (): Image[] {
		return this._backgrounds;
	}

	get edge (): number [] {
		return [
			this._sprite.gameObject.getLeftCenter().x + (this._riversideWidth),
			this._sprite.gameObject.getRightCenter().x - (this._riversideWidth),
			this._sprite.gameObject.getTopCenter().y,
			this._sprite.gameObject.getBottomCenter().y,
		];
	}

	get thresholdPooling (): number {
		return this.screenUtility.height;
	}

	get maxSpeedResistanceThreshold (): number {
		return 1.2;
	}

	private createRiverBackground (): void {
		const { centerX, width, height } = this.screenUtility;

		const riverBg0 = new Image(this._scene, centerX, 0, Assets.bg_river.key);
		riverBg0.transform.setMinPreferredDisplaySize(width, height);
		riverBg0.gameObject.setOrigin(0.5, 0);
		this._backgrounds.push(riverBg0);

		const riverBg1 = new Image(this._scene, centerX, riverBg0.gameObject.getBottomCenter().y, Assets.bg_river.key);
		riverBg1.transform.setMinPreferredDisplaySize(width, height);
		riverBg1.gameObject.setOrigin(0.5, 0);
		this._backgrounds.push(riverBg1);
	}

	private createRiverside (): void {
		const { width } = this.screenUtility;

		const riverSideLeft0 = new Image(this._scene, 0, 0, Assets.forest_parallax.key);
		riverSideLeft0.transform.setToScaleDisplaySize(this._sprite.transform.displayToOriginalHeightRatio);
		riverSideLeft0.gameObject.setOrigin(0).setDepth(RIVERSIDE_DEPTH);
		this._backgrounds.push(riverSideLeft0);

		const riverSideLeft1 = new Image(this._scene, 0, riverSideLeft0.gameObject.getBottomCenter().y, Assets.forest_parallax.key);
		riverSideLeft1.transform.setToScaleDisplaySize(this._sprite.transform.displayToOriginalHeightRatio);
		riverSideLeft1.gameObject.setOrigin(0).setDepth(RIVERSIDE_DEPTH);
		this._backgrounds.push(riverSideLeft1);

		const riverSideRight0 = new Image(this._scene, width, 0, Assets.forest_parallax.key);
		riverSideRight0.transform.setToScaleDisplaySize(this._sprite.transform.displayToOriginalHeightRatio);
		riverSideRight0.gameObject.setOrigin(1, 0).setFlipX(true).setDepth(RIVERSIDE_DEPTH);
		this._backgrounds.push(riverSideRight0);

		const riverSideRight1 = new Image(this._scene, width, riverSideRight0.gameObject.getBottomCenter().y, Assets.forest_parallax.key);
		riverSideRight1.transform.setToScaleDisplaySize(this._sprite.transform.displayToOriginalHeightRatio);
		riverSideRight1.gameObject.setOrigin(1, 0).setFlipX(true).setDepth(RIVERSIDE_DEPTH);
		this._backgrounds.push(riverSideRight1);

		const coefThreshold = 16;
		this._riversideWidth = (riverSideLeft0.gameObject.displayWidth / coefThreshold);
	}

	create (): void {
		const { centerX, centerY, width, height } = this.screenUtility;
		const color = 0x74b9ff;
		this._sprite = new Rectangle(this._scene, centerX, centerY, 1080, 1920, color, 1);
		this._sprite.transform.setMaxPreferredDisplaySize(width, height);

		this.createRiverBackground();
		this.createRiverside();

		const bgGameObjects = this._backgrounds.map((img) => img.gameObject);
		this.event.emit(EventNames.onCreateFinish, [this._sprite.gameObject, ...bgGameObjects]);
	}

}