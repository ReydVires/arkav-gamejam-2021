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
	private _scoreText: Text;
	private _scoreBestText: Text;
	private _scoreString: string;
	private _scoreBestString: string;

	constructor (private _scene: Phaser.Scene) {
		this.screenUtility = ScreenUtilController.getInstance();
		this.event = new Phaser.Events.EventEmitter();
	}

	get restartKey (): Phaser.Input.Keyboard.Key {
		return this._restartKey;
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

	createGameOverScreen (): void {
		const { centerX, centerY, width, height } = this.screenUtility;

		const scoreHolder = new Image(this._scene, centerX, centerY, Assets.panel_game_over.key);
		scoreHolder.transform.setToScaleDisplaySize(this._displayPercentage);
		
		const { x: bottomX, y: bottomY } = scoreHolder.gameObject.getBottomLeft();
		const { x: bottomRightX, y: bottomRightY } = scoreHolder.gameObject.getBottomRight();
		
		const { x, y } = scoreHolder.transform.getDisplayPositionFromCoordinate(0.5, 0.5);
		const fontSize = 42 * scoreHolder.transform.displayToOriginalHeightRatio;
		const container = this._scene.add.container().setDepth(UI_LAYER);

		// best score
		this._scoreBestText = new Text(this._scene, x, y, "0", {
			fontFamily: FontAsset.potta.key,
			fontStyle: "normal",
			align: "center",
			fontSize: `${fontSize}px`
		});
		this._scoreBestText.gameObject.setOrigin(0.5);
		this._scoreBestText.gameObject.setText(this._scoreBestString);
		container.add([scoreHolder.gameObject, this._scoreBestText.gameObject]);

		// new score 
		this._scoreText = new Text(this._scene, x, y+80, "0", {
			fontFamily: FontAsset.potta.key,
			fontStyle: "normal",
			align: "center",
			fontSize: `${fontSize}px`
		});
		this._scoreText.gameObject.setOrigin(0.5);
		this._scoreText.gameObject.setText(this._scoreString);
		container.add([scoreHolder.gameObject, this._scoreText.gameObject]);
		
		
		const restartBtn = new Image(this._scene, centerX, bottomY+25, Assets.btn_retry.key);
		restartBtn.transform.setToScaleDisplaySize(this._displayPercentage);
		restartBtn.gameObject.setOrigin(0.5);

		const restartBtnEffect = this._scene.tweens.create({
			targets: restartBtn.gameObject,
			props: {
				scale: { getEnd: () => restartBtn.gameObject.scale * 0.9 }
			},
			duration: 55,
			yoyo: true,
			onComplete: () => this.event.emit(EventNames.onClickRestart),
		});
		restartBtn.gameObject.setInteractive({useHandCursor: true}).once("pointerdown", () => {
			this.event.emit(EventNames.onPlaySFXClick);
			restartBtnEffect.play();
		});
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
			this.event.emit(EventNames.onPlaySFXClick);
			startBtnEffect.play();
		});

		const logo = new Image(this._scene, centerX, height * 0.15, Assets.logo_title.key);
		logo.transform.setToScaleDisplaySize(this._displayPercentage);

		const contentCredit = "Made by: Arsyel, Mastra, Hasbi, Savira, Witsqa";
		const fontSize = 38 * this._displayPercentage;
		const creditText = new Text(this._scene, centerX, height * 0.95, contentCredit, {
			fontFamily: FontAsset.potta.key,
			fontSize: `${fontSize}px`,
			align: "center",
		});
		creditText.gameObject.setOrigin(0.5);

		this._uiTitleScreen = this._scene.add.container().setDepth(UI_LAYER);
		this._uiTitleScreen.setSize(width, height);
		this._uiTitleScreen.add([logo.gameObject, startBtn.gameObject, creditText.gameObject]);
	}

	setScore (score: number): void {
		this._scoreText.gameObject.setText(score.toString());
		this._scoreString = score.toString();
	}

	setHighScore (status: boolean): void {
		if(this._scoreString > this._scoreBestString){
			this._scoreBestString = this._scoreString;
			window.localStorage.setItem('scoreBestString', this._scoreBestString);
		}
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
		this._scoreBestString = JSON.parse(localStorage.getItem('scoreBestString') || '0');

		this.createScoreText();
		this.createTitleUI();
		this.event.emit(EventNames.onCreateFinish);
	}

}