import Ajv from "ajv";
import DefinitionsSchema from "../jsonschema/definitions.json";

const ajv = new Ajv();
ajv.addSchema(DefinitionsSchema);

/**
 * @description middleware for input validation
 * @param {object} schema a json schema
 * @returns {function(express.Request, express.Response, next)} middleware function
 */
export default (schema) => {
    const validate = ajv.compile(schema);
    return (req, res, next) => {
        if (validate(req.body)) {
            return next();
        }
        const [error] = validate.errors;
        const {dataPath, message} = error;
        res.status(400).json({
            error: {
                message,
                context: {input: dataPath.substr(1)}
            }
        });
    };
};


