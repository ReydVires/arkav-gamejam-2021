import { Transform } from "./components/Transform";

export class ArcadeSprite {

	private _gameObject: Phaser.Physics.Arcade.Sprite;
	private _transform: Transform;

	constructor (private _scene: Phaser.Scene, x: number, y: number, texture: string, frame = 0) {
		this._gameObject = _scene.physics.add.sprite(x, y, texture, frame);
		this._transform = new Transform(_scene, this._gameObject);
	}

	get gameObject (): Phaser.Physics.Arcade.Sprite { return this._gameObject; }

	get transform (): Transform { return this._transform; }

}