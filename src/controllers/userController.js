const { User, sequelize } = require('../db/models/index')
const { ErrHandler } = require('../middlewares/errHandlerMiddleware')
const BcryptUtil = require('../utils/bcryptUtil')
const fs = require('fs')

class UserController {
    static async getAllUser(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const { count, rows } = await User.findAndCountAll({
                offset,
                limit,
            });

            res.status(200).json({
                success: true,
                statusCode: 200,
                message: "User data retrieved successfully",
                meta: {
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: +page,
                    itemPage: rows.length,
                    nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
                    prevPage: page > 1 ? page - 1 : null,
                },
                data: rows
            })
        } catch (error) {
            next(error)
        }
    }

    static async getUserProfile(req, res, next) {
        try {
            const { id } = req.loggedUser
            const foundUser = await User.findOne({ where: { id }, attributes: { exclude: ['id', 'password', 'otpSecret', 'createdAt', 'updatedAt'] } })
            if (!foundUser) {
                throw new ErrHandler(404, 'User is not found.')
            }

            res.status(200).json({
                success: true,
                statusCode: 200,
                message: "User data retrieved successfully",
                data: foundUser
            })
        } catch (error) {
            next(error)
        }
    }

    static async getUserById(req, res, next) {
        try {
            const foundUser = await User.findOne({ where: { id: req.params.id } })
            if (!foundUser) {
                throw new ErrHandler(404, 'User is not found.')
            }

            res.status(200).json({
                success: true,
                statusCode: 200,
                message: "User data retrieved successfully",
                data: foundUser
            })
        } catch (error) {
            next(error)
        }
    }

    static async updateUser(req, res, next) {
        try {
            let payload
            const { id } = req.loggedUser
            const { firstName, lastName, username, email, phoneNumber, oldPassword, newPassword } = req.body

            const foundUser = await User.findOne({ where: { id } })

            payload = {
                firstName: firstName || foundUser.firstName,
                lastName: lastName || foundUser.lastName,
                username: username || foundUser.username,
                email: email || foundUser.email,
                phoneNumber: phoneNumber || foundUser.phoneNumber,
            }

            const filename = foundUser.imgUrl.split("/").pop();
            const folderPath = `public/images/${filename}`;
            if (fs.existsSync(folderPath)) {
                fs.unlinkSync(folderPath)
            }

            if (req.file) {
                const imagePath = `http://localhost:${process.env.PORT}/images/${req.file.filename}`;
                payload = {
                    ...payload,
                    imgUrl: imagePath,
                };
            }

            if (oldPassword) {
                const checkPassword = BcryptUtil.comparePassword(oldPassword, foundUser.password)
                if (checkPassword) {
                    const hashedPassword = BcryptUtil.hashPassword(newPassword)
                    payload = {
                        ...payload,
                        password: hashedPassword
                    }
                } else {
                    throw new ErrHandler(401, 'New and old password doesn\'t match.')
                }
            }

            await User.update(payload, { where: { id } })
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: "User updated successfully",
            })
        } catch (error) {
            next(error)
        }
    }

    static async deleteUser(req, res, next) {
        const t = await sequelize.transaction()
        try {
            const { id } = req.params
            const { userId } = req.body

            if (userId) {
                for (let i = 0; i < userId.length; i++) {
                    const idUser = userId[i];

                    const foundUser = await User.findOne({ where: { id: +idUser }, transaction: t });
                    if (!foundUser) {
                        throw new ErrHandler(404, 'User is not found.');
                    }
                    const filename = foundUser.imgUrl && foundUser.imgUrl.split("/").pop();
                    const folderPath = `public/images/${filename}`;
                    if (fs.existsSync(folderPath)) {
                        fs.unlinkSync(folderPath)
                    }
                    await foundUser.destroy({ transaction: t });
                }
            } else {
                const foundUser = await User.findOne({ where: { id }, transaction: t });
                if (!foundUser) {
                    throw new ErrHandler(404, 'User is not found.');
                }
                const filename = foundUser.imgUrl && foundUser.imgUrl.split("/").pop();
                const folderPath = `public/images/${filename}`;
                if (fs.existsSync(folderPath)) {
                    fs.unlinkSync(folderPath)
                }
                await foundUser.destroy({ transaction: t });
            }

            await t.commit();
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: "User deleted successfully",
            })
        } catch (error) {
            await t.rollback();
            next(error)
        }
    }
}

module.exports = UserController