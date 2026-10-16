import sys
import uvicorn
from . import config

if __name__ == "__main__":
    try:
        config.validate()
    except RuntimeError as error:
        sys.exit(str(error))
    uvicorn.run("app.main:app", host="0.0.0.0", port=config.PORT)
