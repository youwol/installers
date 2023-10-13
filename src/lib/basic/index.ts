import { Installer, ExplorerState } from '@youwol/os-core'
import { AssetsBackend, ExplorerBackend } from '@youwol/http-clients'
import { uploadFile$ } from './asset-specific/upload-data'
import { PackageInfoView } from './asset-specific'
import { FileInfoView } from './asset-specific/file-info.view'
export * from './asset-specific'

export async function install(installer: Installer): Promise<Installer> {
    console.log('Basic installer!!!')
    return installer.with({
        fromManifests: [
            {
                id: '@youwol/installers.basic',
                applications: [
                    '@youwol/explorer',
                    '@youwol/cdn-explorer',
                ].concat(
                    location.hostname === 'localhost' ||
                        location.hostname === '127.0.0.1'
                        ? ['@youwol/developer-portal']
                        : [],
                ),
                assetPreviews: ({
                    asset,
                    permissions,
                }: {
                    asset: AssetsBackend.GetAssetResponse
                    permissions: AssetsBackend.GetPermissionsResponse
                }) => {
                    return [
                        {
                            icon: 'fas fa-info',
                            name: 'Package info',
                            exe: () => {
                                return new PackageInfoView({ asset })
                            },
                            applicable: () => {
                                return asset.kind == 'package'
                            },
                        },
                        {
                            icon: 'fas fa-info',
                            name: 'File info',
                            exe: () => {
                                return new FileInfoView({ asset, permissions })
                            },
                            applicable: () => {
                                return asset.kind == 'data'
                            },
                        },
                    ]
                },
                contextMenuActions: ({
                    node,
                    explorer,
                }: {
                    node:
                        | ExplorerBackend.GetItemResponse
                        | ExplorerBackend.GetFolderResponse
                    explorer: ExplorerState
                }) => {
                    return [
                        {
                            name: 'Import data',
                            icon: { class: 'fas fa-file-import' },
                            enabled: () => true,
                            exe: async () => {
                                const input = document.createElement('input')
                                input.setAttribute('type', 'file')
                                input.setAttribute('multiple', 'true')
                                input.dispatchEvent(new MouseEvent('click'))
                                input.onchange = () => {
                                    Array.from(input.files).forEach((file) => {
                                        const status = uploadFile$(node, file)
                                        explorer.newAsset({
                                            parentNode: node,
                                            pendingName: file.name,
                                            response$: status.response$,
                                            progress$: status.progress$,
                                        })
                                    })
                                    input.remove()
                                }
                            },
                            applicable: () =>
                                ExplorerBackend.isInstanceOfFolderResponse(
                                    node,
                                ),
                        },
                    ]
                },
            },
        ],
    })
}
