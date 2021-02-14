import { CustomTypes } from "../../../../types/custom";

export const enum EventNames {
	onScoreChange = "onScoreChange",
}

type OnScoreChange = (score: number) => void;

export class GameController {

	private _event: Phaser.Events.EventEmitter;

	private _state: CustomTypes.Gameplay.State;
	private _score: number;
	private _baseScore: number;
	private _timer: number;
	private _baseTimer: number;

	constructor () {
		this._event = new Phaser.Events.EventEmitter();

		// Should be references from gamedata
		this._baseScore = 5;
		this._baseTimer = 500;
	}

	get state (): CustomTypes.Gameplay.State {
		return this._state;
	}

	init (): void {
		this._state = "TITLE";
		this._score = 0;
		this._timer = this._baseTimer;
	}

	playState (): void {
		this._state = "GAME";
	}

	gameOverState (): void {
		this._state = "GAMEOVER";
	}

	titleState (): void {
		this._state = "TITLE";
	}

	update (time: number, dt: number): void {
		this._timer -= dt * 0.6;
		if (this._timer <= 0) {
			this._score += this._baseScore;
			this._event.emit(EventNames.onScoreChange, this._score);
			this._timer += this._baseTimer;
		}
	}

	onScoreChange (events: OnScoreChange): void {
		this._event.on(EventNames.onScoreChange, events);
	}

}