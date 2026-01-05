import mongoose from "mongoose";

/**
 * User roles enum:
 * 0 = admin (regular admin)
 * 1 = superadmin (can override conflicts, etc.)
 */
export const USER_ROLES = {
  ADMIN: 0,
  SUPERADMIN: 1,
};

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 20,
    },
    // email: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   max: 50,
    // },
    password: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    /**
     * User role:
     * 0 = admin (default) - regular admin
     * 1 = superadmin - can override conflicts, force create orders
     */
    role: {
      type: Number,
      enum: [USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN],
      default: USER_ROLES.ADMIN,
    },
  },
  { timestamps: true }
);

export const User = mongoose.models?.User || mongoose.model("User", userSchema);
