import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['built-in', 'iframe', 'external'],
        default: 'built-in'
    },
    componentName: {
        type: String,
        default: 'Snake'
    },
    externalUrl: {
        type: String,
        default: ''
    },
    desc: {
        type: String,
        default: 'Play this fun game right inside the portfolio!'
    },
    tagline: {
        type: String,
        default: 'Arcade Mini-Game'
    },
    categoryBadge: {
        type: String,
        default: 'Classic'
    },
    features: [{
        type: String,
        trim: true
    }],
    icon: {
        type: String,
        default: 'fa-solid fa-gamepad'
    },
    thumbnail: {
        type: String,
        default: null
    },
    color: {
        type: String,
        default: '#2e86de'
    },
    instructions: {
        type: String,
        default: 'Use arrow keys or touch swipe to play.'
    },
    highScore: {
        type: Number,
        default: 0
    },
    playCount: {
        type: Number,
        default: 0
    },
    order: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Game = mongoose.model('Game', gameSchema);
export default Game;
