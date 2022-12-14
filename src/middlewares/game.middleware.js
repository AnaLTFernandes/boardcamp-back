import connection from "../database/db.js";
import { STATUS_CODE } from "../enums/statusCode.js";
import { gameSchema } from "../schemas/game.schema.js";

async function validateGameData(req, res, next) {
	const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

	const isValidData = gameSchema.validate(
		{
			name,
			image,
			stockTotal,
			categoryId,
			pricePerDay,
		},
		{ abortEarly: false }
	);

	if (isValidData.error) {
		const errors = isValidData.error.details.map((error) => error.message);
		return res.status(STATUS_CODE.BAD_REQUEST).send({ message: errors });
	}

	try {
		const hasCategorie = await connection.query(
			"SELECT * FROM categories WHERE id = $1;",
			[categoryId]
		);

		if (hasCategorie.rows.length === 0)
			return res
				.status(STATUS_CODE.BAD_REQUEST)
				.send({ message: "Id de categoria inválido." });
	} catch (error) {
		console.log(error);
		return res.sendStatus(STATUS_CODE.SERVER_ERROR);
	}

	try {
		const hasName = await connection.query(
			"SELECT * FROM games WHERE name ILIKE $1;",
			[`${name}`]
		);

		if (hasName.rows.length !== 0)
			return res
				.status(STATUS_CODE.CONFLICT)
				.send({ message: "Esse jogo já existe." });
	} catch (error) {
		console.log(error);
		return res.sendStatus(STATUS_CODE.SERVER_ERROR);
	}

	next();
}

export { validateGameData };
