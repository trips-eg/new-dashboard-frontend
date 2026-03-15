import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {
  private baseUrl: string = environment.apiUrl;

    constructor(private http: HttpClient) { }

    downloadFile(url: string): Observable<Blob> {
      return this.http.get(url, { responseType: 'blob' });
    }


   public DownloadFileFromServer(downloadURL){
    let fileUrl=downloadURL;
    // if(this.isStage){
    //   fileUrl  = this.buildUrl(this.baseUrl,downloadURL);
    // }else{
    //   fileUrl = downloadURL;
    // }


      this.downloadFile(fileUrl).subscribe((data: Blob) => {

          const blobUrl = URL.createObjectURL(data);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileUrl; // Specify the file name here
          link.click();
          URL.revokeObjectURL(blobUrl);
      });

  }





  buildUrl(domain: string, filepath: string): string {

    if (domain.endsWith('api/')) {
      domain = domain.slice(0, -4);
    }
    if (filepath.startsWith('/')) {
      filepath = filepath.substring(1);
    }

    return domain + filepath;
  }


  public DownloadReadyFileFromServer(downloadURL){


          const blobUrl = URL.createObjectURL(downloadURL);
          const link = document.createElement('a');
          link.href = blobUrl;
          //link.download = ``; // Specify the file name here
          link.click();
          URL.revokeObjectURL(blobUrl);


  }

  public DownloadReadyFileFromThirdParty(downloadURL){
    const link = document.createElement('a');
    link.href = downloadURL;
    link.target = "_blank";
    //link.setAttribute('download',"shipment.pdf"); // Set file name
    link.download="shipment.pdf";
    link.click();
}

  public DownloadFileFromServerByAnyExtension(response: Blob, filenamePrefix: string, fileExtension: string) {
    const blobUrl = URL.createObjectURL(response);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${filenamePrefix}.${fileExtension}`;
    link.click();
    URL.revokeObjectURL(blobUrl);
}

public downloadFileS(url: string,fileName: string) {
  let fileUrl=this.buildUrl(this.baseUrl,url);
  const anchor = document.createElement('a');
  anchor.href =fileUrl
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(fileUrl);
}

}
