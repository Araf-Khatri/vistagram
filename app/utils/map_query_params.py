from flask import request
from .response_mapper import error_response

def map_query_params(expected_params):
    result = dict()
    for key, default in expected_params.items():
        if isinstance(default, tuple):
            default_value, caster, expected = default
        else:
            default_value, caster, expected = default, str, set()

        raw_value = request.args.get(key, None)

        if raw_value is None:
            result[key] = default_value
        else:
            if expected and raw_value not in expected:
                return error_response(f"Invalid value for {key}. Expected one of {expected}.", 400)
            try:
                result[key] = caster(raw_value) or default_value
            except Exception:
                result[key] = default_value


    return result
