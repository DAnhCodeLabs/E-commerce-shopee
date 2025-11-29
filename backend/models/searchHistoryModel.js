import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },

    keyword: {
      type: String,
      required: true,
      trim: true,
    },

    filters: {
      type: Object,
      default: {},
    },

    result_count: {
      type: Number,
      default: 0,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: "90d" },
    },
  },
  { collection: "search_histories" }
);

const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);
export default SearchHistory;
