import { FontAsset } from "../../library/AssetFont";
import { Assets } from "../../library/AssetGameplay";
import { BaseView } from "../../modules/core/BaseView";
import { Image } from "../../modules/gameobjects/Image";
import { Rectangle } from "../../modules/gameobjects/Rectangle";
import { Text } from "../../modules/gameobjects/Text";
import { ScreenUtilController } from "../../modules/screenutility/ScreenUtilController";

const UI_LAYER = 50;

export const enum EventNames {
	onPlaySFXClick = "onPlaySFXClick",
	onClickStart = "onClickStart",
	onClickHome = "onClickHome",
	onClickRestart = "onClickRestart",
	onCreateFinish = "onCreateFinish",
};

export class GameplaySceneView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	private _displayPercentage: number;
	private _uiTitleScreen: Phaser.GameObjects.Container;
	private _restartKey: Phaser.Input.Keyboard.Key;
	private _scoreUIText: Text;
	private _scoreResultText: Text;
	private _scoreBestText: Text;
	private _gameOverPanel: Phaser.GameObjects.Container;
	private _overlayPanel: Rectangle;

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
		this._scoreUIText = new Text(this._scene, x, y, "0", {
			fontFamily: FontAsset.potta.key,
			fontStyle: "bold",
			align: "center",
			fontSize: `${fontSize}px`
		});
		this._scoreUIText.gameObject.setOrigin(0.5);

		const container = this._scene.add.container().setDepth(UI_LAYER);
		container.add([scoreHolder.gameObject, this._scoreUIText.gameObject]);
	}

	private createGameOverUI (): void {
		const { centerX, centerY, width, height } = this.screenUtility;

		this._overlayPanel = new Rectangle(this._scene, centerX, centerY, width, height, 0x2c3e50);
		this._overlayPanel.gameObject.setInteractive().setDepth(UI_LAYER);
		this._overlayPanel.gameObject.setAlpha(0.35).setVisible(false);

		const gameOverPanel = new Image(this._scene, centerX, centerY * 0.875, Assets.panel_game_over.key);
		gameOverPanel.transform.setToScaleDisplaySize(this._displayPercentage * 1.3);

		const fontSize = 64 * gameOverPanel.transform.displayToOriginalHeightRatio;
		const scoreBestTextPos = gameOverPanel.transform.getDisplayPositionFromCoordinate(0.5, 0.5);
		this._scoreBestText = new Text(this._scene, scoreBestTextPos.x, scoreBestTextPos.y, "0", {
			fontFamily: FontAsset.potta.key,
			fontStyle: "normal",
			align: "center",
			fontSize: `${fontSize}px`
		});
		this._scoreBestText.gameObject.setOrigin(0.5);

		const scoreResultTextPos = gameOverPanel.transform.getDisplayPositionFromCoordinate(0.5, 0.8);
		this._scoreResultText = new Text(this._scene, scoreResultTextPos.x, scoreResultTextPos.y, "0", {
			fontFamily: FontAsset.potta.key,
			fontStyle: "normal",
			align: "center",
			fontSize: `${fontSize}px`
		});
		this._scoreResultText.gameObject.setOrigin(0.5);

		const { y: bottomY } = gameOverPanel.gameObject.getBottomCenter();
		const restartBtn = new Image(this._scene, centerX, bottomY, Assets.btn_retry.key);
		restartBtn.transform.setToScaleDisplaySize(gameOverPanel.transform.displayToOriginalHeightRatio * 1.2);
		restartBtn.gameObject.x -= restartBtn.transform.displayWidth / 1.5;
		restartBtn.gameObject.y += restartBtn.transform.displayHeight / 2.35;

		const restartEffect = this.setEffect(restartBtn.gameObject, () => this.event.emit(EventNames.onClickRestart));
		restartBtn.gameObject.setInteractive({useHandCursor: true}).once("pointerdown", () => {
			this.event.emit(EventNames.onPlaySFXClick);
			restartEffect.play();
		});

		const homeBtnPos = restartBtn.transform.getDisplayPositionFromCoordinate(1, 0.5);
		const homeBtn = new Image(this._scene, homeBtnPos.x, homeBtnPos.y, Assets.btn_home.key);
		homeBtn.transform.setToScaleDisplaySize(gameOverPanel.transform.displayToOriginalHeightRatio * 1.2);
		homeBtn.gameObject.x += homeBtn.transform.displayWidth / 1.5;

		const homeBtnEffect = this.setEffect(homeBtn.gameObject, () => this.event.emit(EventNames.onClickHome));
		homeBtn.gameObject.setInteractive({useHandCursor: true}).once("pointerdown", () => {
			this.event.emit(EventNames.onPlaySFXClick);
			homeBtnEffect.play();
		});

		this._gameOverPanel = this._scene.add.container().setDepth(UI_LAYER);
		this._gameOverPanel.add([
			gameOverPanel.gameObject,
			this._scoreResultText.gameObject,
			this._scoreBestText.gameObject,
			homeBtn.gameObject,
			restartBtn.gameObject,
		]);
		this._gameOverPanel.setVisible(false);
	}

	private createTitleUI (): void {
		const { centerX, centerY, width, height } = this.screenUtility;

		const startBtn = new Image(this._scene, centerX, centerY, Assets.btn_start.key);
		startBtn.transform.setToScaleDisplaySize(this._displayPercentage);
		startBtn.gameObject.y += startBtn.transform.displayHeight / 2;

		const startBtnEffect = this._scene.tweens.create({
			targets: startBtn.gameObject,
			props: {
				scale: { getEnd: () => startBtn.gameObject.scale * 0.9 }
			},
			duration: 55,
			yoyo: true,
		});

		startBtn.gameObject.setInteractive({useHandCursor: true}).once("pointerdown", () => {
			this.event.emit(EventNames.onPlaySFXClick);
			this.hideTitleScreen();
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

		const instructionPanel = new Image(this._scene, centerX + width, centerY, Assets.panel_instructions.key);
		instructionPanel.transform.setToScaleDisplaySize(this._displayPercentage * 1.3);

		const playBtnPos = instructionPanel.transform.getDisplayPositionFromCoordinate(0.5, 1);
		const playBtn = new Image(this._scene, playBtnPos.x, playBtnPos.y, Assets.btn_play.key);
		playBtn.transform.setToScaleDisplaySize(this._displayPercentage);
		playBtn.gameObject.y += playBtn.transform.displayHeight * 0.4;

		const playBtnEffect = this.setEffect(playBtn.gameObject, () => {
			this._scene.tweens.add({
				targets: this._uiTitleScreen,
				props: {
					x: { getEnd: () => -this._uiTitleScreen.displayWidth * 2 },
				},
				ease: Phaser.Math.Easing.Quintic.InOut,
				duration: 250,
				onComplete: () => this._uiTitleScreen.setVisible(false)
			});
		});
		playBtn.gameObject.setInteractive({useHandCursor: true}).on("pointerdown", () => {
			this.event.emit(EventNames.onPlaySFXClick);
			this.event.emit(EventNames.onClickStart);
			playBtnEffect.play();
		});

		this._uiTitleScreen = this._scene.add.container().setDepth(UI_LAYER);
		this._uiTitleScreen.setSize(width, height);
		this._uiTitleScreen.add([
			logo.gameObject,
			startBtn.gameObject,
			creditText.gameObject,
			instructionPanel.gameObject,
			playBtn.gameObject,
		]);
	}

	private setEffect (gameObject: Phaser.GameObjects.Image, onComplete: Phaser.Types.Tweens.TweenOnCompleteCallback): Phaser.Tweens.Tween {
		const props: Phaser.Types.Tweens.TweenPropConfig = {
			getEnd: () => gameObject.scale * 0.85
		};
		return this._scene.tweens.create({
			targets: gameObject,
			props: { scale: props },
			duration: 55,
			yoyo: true,
			onComplete: onComplete,
		});
	};

	setHighscore (score: string): void {
		this._scoreBestText.gameObject.setText(score);
	}

	setScore (score: number): void {
		this._scoreUIText.gameObject.setText(score.toString());
		this._scoreResultText.gameObject.setText(score.toString());
	}

	hideTitleScreen (isImmediate?: boolean): void {
		if (isImmediate) {
			this._uiTitleScreen.setVisible(false);
			return;
		}

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

	showGameOverPanel (): void {
		const { height } = this.screenUtility;
		const panelEffect = this._scene.tweens.create({
			onStart: () => this._gameOverPanel.setVisible(true),
			targets: this._gameOverPanel,
			props: {
				y: { getStart: () => -height, getEnd: () => 0 }
			},
			duration: 500,
			ease: Phaser.Math.Easing.Back.InOut,
		});
		this._overlayPanel.gameObject.setVisible(true);
		panelEffect.play();
	}

	create (displayPercentage: number): void {
		this._displayPercentage = displayPercentage;
		this._restartKey = this._scene.input.keyboard.addKey("R");

		this.createScoreText();
		this.createTitleUI();
		this.createGameOverUI();
		this.event.emit(EventNames.onCreateFinish);
	}

}