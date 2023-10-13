import { ReplaySubject } from 'rxjs'

import { AssetsGateway, FilesBackend } from '@youwol/http-clients'
import { raiseHTTPErrors, RequestEvent } from '@youwol/http-primitives'
type NewAssetResponse =
    AssetsGateway.NewAssetResponse<FilesBackend.UploadResponse>

export function uploadFile$(folder, file: File) {
    const progress$ = new ReplaySubject<RequestEvent>(1)
    const response$ = new ReplaySubject<NewAssetResponse>(1)

    const client = new AssetsGateway.Client().files
    client
        .upload$({
            body: { fileName: file.name, content: file },
            queryParameters: { folderId: folder.id },
            callerOptions: {
                monitoring: {
                    channels$: [progress$],
                    requestId: file.name,
                },
            },
        })
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            response$.next(resp as NewAssetResponse)
        })

    return {
        response$,
        progress$,
    }
}
