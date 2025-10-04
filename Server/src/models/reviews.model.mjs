import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book", // Which book this review belongs to
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Who wrote the review
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        reviewText: {
            type: String,
            default: "",
            trim: true,
        },
    },
    { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
