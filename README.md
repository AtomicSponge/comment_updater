# Comment Updater NodeJS Script

__WARNING!__  This script mass-modifies source code files.  Use at your own risk!

Batch updates code comments at the top of source files.

```
{
    "author": "Time Lincoln",
    "comment_blocks": [
        {
            "name": "block1",
            "block": "\\author: $AUTHOR\n\\version:  $VERSION\n\\date:  2019-$YYYY",
            "comment_start": "/*!",
            "comment_end": " */",
            "line_delimiter": " * "
        },
        {
            "name": "block2",
            "block": "second block\nlazy example",
            "comment_start": "/*!",
            "comment_end": " */",
            "line_delimiter": " * "
        }
    ],
    "jobs": [
        {
            "job": "Source files",
            "block": "block2",
            "location": "/home/matthew/Projects/wtengine/src",
            "extension": ".cpp",
            "recursive": "true"
        },
        {
            "job": "Header files",
            "block": "block1",
            "location": "/home/matthew/Projects/wtengine/include/wtengine",
            "extension": ".hpp"
        }
    ]
}
```