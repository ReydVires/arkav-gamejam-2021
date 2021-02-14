import { FontAsset } from "../../library/AssetFont";
import { Assets } from "../../library/AssetGameplay";
import { BaseView } from "../../modules/core/BaseView";
import { Image } from "../../modules/gameobjects/Image";
import { Text } from "../../modules/gameobjects/Text";
import { ScreenUtilController } from "../../modules/screenutility/ScreenUtilController";

const UI_LAYER = 50;

export const enum EventNames {
	onPlaySFXClick = "onPlaySFXClick",
	onClickStart = "onClickStart",
	onClickRestart = "onClickRestart",
	onCreateFinish = "onCreateFinish",
};

export class GameplaySceneView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	private _displayPercentage: number;
	private _uiTitleScreen: Phaser.GameObjects.Container;
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

		const container = this._scene.add.container().setDepth(UI_LAYER);
		container.add([scoreHolder.gameObject, this._scoreText.gameObject]);
	}

	private createTitleUI (): void {
		const { centerX, centerY, width, height } = this.screenUtility;

		const startBtn = new Image(this._scene, centerX, centerY, Assets.btn_start.key);
		startBtn.transform.setToScaleDisplaySize(this._displayPercentage);

		const startBtnEffect = this._scene.tweens.create({
			targets: startBtn.gameObject,
			props: {
				scale: { getEnd: () => startBtn.gameObject.scale * 0.9 }
			},
			duration: 55,
			yoyo: true,
			onComplete: () => this.event.emit(EventNames.onClickStart),
		});

		startBtn.gameObject.setInteractive({useHandCursor: true}).once("pointerdown", () => {
			startBtnEffect.play();
		});

		const contentTitle = "Raka's Journey";
		const fontTitleSize = 72 * this._displayPercentage;
		const titleText = new Text(this._scene, centerX, height * 0.15, contentTitle, {
			fontFamily: FontAsset.potta.key,
			fontSize: `${fontTitleSize}px`,
			align: "center",
			fontStyle: "bold"
		});
		titleText.gameObject.setOrigin(0.5);

		const contentCredit = "Made by: Yeager, Mastra, Hasbi, Savira, Witsqa";
		const fontSize = 38 * this._displayPercentage;
		const creditText = new Text(this._scene, centerX, height * 0.95, contentCredit, {
			fontFamily: FontAsset.potta.key,
			fontSize: `${fontSize}px`,
			align: "center",
		});
		creditText.gameObject.setOrigin(0.5);

		this._uiTitleScreen = this._scene.add.container().setDepth(UI_LAYER);
		this._uiTitleScreen.setSize(width, height);
		this._uiTitleScreen.add([titleText.gameObject, startBtn.gameObject, creditText.gameObject]);
	}

	setScore (score: number): void {
		this._scoreText.gameObject.setText(score.toString());
	}

	hideTitleScreen (): void {
		const tweenEffect = this._scene.tweens.create({
			targets: this._uiTitleScreen,
			props: {
				x: { getStart: () => 0, getEnd: () => -this._uiTitleScreen.displayWidth },
			},
			ease: Phaser.Math.Easing.Quintic.InOut,
			duration: 500,
		});
		tweenEffect.play();
	}

	create (displayPercentage: number): void {
		this._displayPercentage = displayPercentage;

		this._restartKey = this._scene.input.keyboard.addKey("R");
		this._debugKey = this._scene.input.keyboard.addKey("Z");

		this.createScoreText();
		this.createTitleUI();
		this.event.emit(EventNames.onCreateFinish);
	}

}