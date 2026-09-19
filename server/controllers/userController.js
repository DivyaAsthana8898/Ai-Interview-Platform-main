const getUserProfile = async (req, res) => {
    try {
        res.status(200).json({
            message: "User profile fetched successfully",
            user: req.user
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { name, skills, targetRole } = req.body;

        const user = req.user;

        if (name) {
            user.name = name;
        }

        if (skills) {
            user.skills = skills;
        }

        if (targetRole) {
            user.targetRole = targetRole;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                skills: updatedUser.skills,
                targetRole: updatedUser.targetRole
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile
};