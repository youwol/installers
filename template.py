import shutil
from pathlib import Path

from youwol.pipelines.pipeline_typescript_weback_npm import Template, PackageType, Dependencies, \
    RunTimeDeps, generate_template, Bundles, MainModule
from youwol.utils import parse_json

folder_path = Path(__file__).parent

pkg_json = parse_json(folder_path / 'package.json')


template = Template(
    path=folder_path,
    type=PackageType.Library,
    name=pkg_json['name'],
    version=pkg_json['version'],
    shortDescription=pkg_json['description'],
    author=pkg_json['author'],
    dependencies=Dependencies(
        runTime=RunTimeDeps(
            externals={
                "@youwol/os-core": "^0.1.13",
                "@youwol/http-clients": "^2.0.5",
                "@youwol/http-primitives": "^0.1.2",
                "rxjs": "^6.5.5",
                "@youwol/cdn-client": "^2.0.6",
                # fv-input is fetched in due time when needed, not part of a 'loadDependencies'
                "@youwol/fv-input": "^0.2.1",
            }
        ),
        devTime={
            # The two dependencies below are required for typedoc to run properly
            "@types/lz-string": "^1.3.34",
            "lz-string": "^1.4.4",
            "@youwol/os-widgets": "^0.1.0"
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
                "@youwol/cdn-client",
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


