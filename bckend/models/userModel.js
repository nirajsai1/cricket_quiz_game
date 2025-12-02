import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    type: { type: String, required: true },
    bat_type: { type: String, required: true },
    bowl_type: { type: String, required: true },

    ipl_teams_played: {
      type: String, 
    },

    indian: { type: String},
    retired: { type: String},
    intl_debut: { type: String},

    matches: { type: Number },
    last_season: { type: Number },
    debut: { type: Number },

    nation: { type: String, required: true },
    id: { type: Number, required: true }
  },
  {
   timestamps: true }
);
export const userModel =mongoose.model("cricketers",userSchema);