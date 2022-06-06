# Comment Updater NodeJS Script

Batch updates code comments at the top of source files

```
{
    "author": "Matthew Evans",
    "comment_start": "/*!",
    "comment_end": " */",
    "line_delimiter": " * ",
    "comment_blocks": [
        {
            "name": "block1",
            "block": "main block"
        },
        {
            "name": "block2",
            "block": "second block"
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
            "extension": ".hpp",
            "recursive": "true"
        }
    ]
}
```