import { FontAsset } from "../../library/AssetFont";
import { Assets } from "../../library/AssetGameplay";
import { BaseView } from "../../modules/core/BaseView";
import { Image } from "../../modules/gameobjects/Image";
import { Text } from "../../modules/gameobjects/Text";
import { ScreenUtilController } from "../../modules/screenutility/ScreenUtilController";

export const enum EventNames {
	onPlaySFXClick = "onPlaySFXClick",
	onClickRestart = "onClickRestart",
	onCreateFinish = "onCreateFinish",
};

export class GameplaySceneView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	private _displayPercentage: number;
	private _uiView: Phaser.GameObjects.Container;
	private _restartKey: Phaser.Input.Keyboard.Key;
	private _debugKey: Phaser.Input.Keyboard.Key;
	private _scoreText: Text;

	constructor (private _scene: Phaser.Scene) {
		this.screenUtility = ScreenUtilController.getInstance();
		this.event = new Phaser.Events.EventEmitter();
	}

	get restartKey (): Phaser.Input.Keyboard.Key {
		return this._restartKey;
	}

	get debugKey (): Phaser.Input.Keyboard.Key {
		return this._debugKey;
	}

	private createScoreText (): void {
		const { width, height } = this.screenUtility;
		const scoreHolder = new Image(this._scene, (width * 0.925), (height * 0.025), Assets.score_holder.key);
		scoreHolder.transform.setToScaleDisplaySize(this._displayPercentage);

		const { x: bottomX, y: bottomY } = scoreHolder.gameObject.getBottomLeft();
		scoreHolder.gameObject.setPosition(bottomX, bottomY);

		const { x, y } = scoreHolder.transform.getDisplayPositionFromCoordinate(0.5, 0.5);
		const fontSize = 64 * scoreHolder.transform.displayToOriginalHeightRatio;
		this._scoreText = new Text(this._scene, x, y, "0", {
			fontFamily: FontAsset.potta.key,
			fontStyle: "bold",
			align: "center",
			fontSize: `${fontSize}px`
		});
		this._scoreText.gameObject.setOrigin(0.5);

		this._uiView.add([scoreHolder.gameObject, this._scoreText.gameObject]);
	}

	setScore (score: number): void {
		this._scoreText.gameObject.setText(score.toString());
	}

	create (displayPercentage: number): void {
		this._displayPercentage = displayPercentage;

		this._uiView = this._scene.add.container().setDepth(50);
		this._restartKey = this._scene.input.keyboard.addKey("R");
		this._debugKey = this._scene.input.keyboard.addKey("Z");
		this.createScoreText();
		this.event.emit(EventNames.onCreateFinish, this._uiView);
	}

}