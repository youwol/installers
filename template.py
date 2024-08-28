import shutil
from pathlib import Path

from youwol.pipelines.pipeline_typescript_weback_npm import Template, PackageType, Dependencies, \
    RunTimeDeps, generate_template, Bundles, MainModule
from youwol.utils import parse_json

folder_path = Path(__file__).parent

pkg_json = parse_json(folder_path / 'package.json')


template = Template(
    path=folder_path,
    type=PackageType.LIBRARY,
    name=pkg_json['name'],
    version=pkg_json['version'],
    shortDescription=pkg_json['description'],
    author=pkg_json['author'],
    dependencies=Dependencies(
        runTime=RunTimeDeps(
            externals={
                "@youwol/os-core": "^0.2.1",
                "@youwol/http-clients": "^3.0.1",
                "@youwol/http-primitives": "^0.2.5",
                "rxjs": "^7.5.6",
                "@youwol/webpm-client": "^3.0.7",
                # Fetched at run time
                "@youwol/os-widgets": "^0.2.6"
            }
        ),
        devTime={
            "lz-string": "^1.4.4",
        }
    ),
    bundles=Bundles(
        mainModule=MainModule(
            entryFile='./lib/index.ts',
            loadDependencies=[
                "@youwol/os-core",
                "@youwol/http-clients",
                "@youwol/http-primitives",
                "rxjs",
                "@youwol/webpm-client",
            ]
        )
    ),
    userGuide=True
)

generate_template(template)

shutil.copyfile(
    src=folder_path / '.template' / 'src' / 'auto-generated.ts',
    dst=folder_path / 'src' / 'auto-generated.ts'
)
for file in ['README.md', '.gitignore', '.npmignore', '.prettierignore', 'LICENSE', 'package.json',
             'tsconfig.json', 'webpack.config.ts']:
    shutil.copyfile(
        src=folder_path / '.template' / file,
        dst=folder_path / file
    )


