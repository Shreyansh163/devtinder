// What is enum?
// A special, user defined data type that represents a fixed set of named constants.
// enums restrict a variable to only hold one of these predefined values

const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to the User collection
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to the User collection
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignore", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  { timestamps: true },
);

// indexing: when executing some find function to find a connection request, without indexing it will be expensive to find that particular data if there are millions of data.
// compound indexing: we can index multiple fields if needed by assigning all those field inside index function.

connectionRequestSchema.index({ firstName: 1 }, { lastName: 1 });

// Schema level validation:
// pre is a middleware.
// pre will execute right before save function present in request.js.
connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  // check if fromUserId is same as toUserId
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Can't send connection request to yourself");
  }
  next;
});

const ConnectionRequestModel = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema,
);

module.exports = ConnectionRequestModel;
