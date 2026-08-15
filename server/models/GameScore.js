// server/models/GameScore.js
import mongoose from 'mongoose';

const gameScoreSchema = new mongoose.Schema({
    gameSlug: {
        type: String,
        required: true,
        enum: ['snake', '2048', 'typing', 'tictactoe'],
        index: true
    },
    playerName: {
        type: String,
        default: 'Player',
        trim: true,
        maxLength: 30
    },
    score: {
        type: Number,
        required: true,
        index: true
    },
    metrics: {
        wpm: { type: Number },
        accuracy: { type: Number },
        highestTile: { type: Number },
        moves: { type: Number },
        durationSeconds: { type: Number }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    ip: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Index for fast leaderboard retrieval
gameScoreSchema.index({ gameSlug: 1, score: -1 });

const GameScore = mongoose.model('GameScore', gameScoreSchema);
export default GameScore;
