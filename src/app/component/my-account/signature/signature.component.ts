import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { EncounterService } from "src/app/services/encounter.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "../../../../environments/environment";
declare var getFromStorage: any;

@Component({
  selector: "app-signature",
  templateUrl: "./signature.component.html",
  styleUrls: ["./signature.component.css"],
})
export class SignatureComponent implements OnInit {
  baseURL = environment.baseURL;
  baseURLProvider = `${this.baseURL}/provider/${this.data.pid}/attribute`;
  addSignatureForm = new FormGroup({
    signature: new FormControl(""),
    text: new FormControl(""),
  });
  status = false;
  name = "Enter text";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private service: EncounterService,
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<SignatureComponent>
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    if (this.data.type == "edit") {
      this.name = this.data.name;
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    const formValue = this.addSignatureForm.value;
    const signatureValue = formValue.signature;
    const signText = formValue.text;
    if (signatureValue === "1") {
      this.signature(signText, "arty");
    }
    if (signatureValue === "2") {
      this.signature(signText, "asem");
    }
    if (signatureValue === "3") {
      this.signature(signText, "youthness");
    }
    if (signatureValue === "4") {
      this.signature(signText, "almondita");
    }
  }

  /**
   * Save repective signature font in the system as per user selection
   * @param text String
   * @param font String
   */
  signature = (text: string, font: string) => {
    const userDetails = getFromStorage("user");
    const providerDetails = getFromStorage("provider");
    if (userDetails && providerDetails && this.data.type == "add") {
      const providerUuid = providerDetails.uuid;
      this.service.signRequest(providerUuid).subscribe((res) => {
        const data = res.results;
        if (data.length !== 0) {
          data.forEach((value) => {
            if (value.display.match("textOfSign") !== null) {
              this.status = true;
            }
          });
        }
        if (!this.status) {
          const url2 = `${this.baseURL}/provider/${providerUuid}/attribute`;
          const json = {
            attributeType: "c1c6458d-383b-4034-afa0-16a34185b458",
            value: text,
          };
          this.http.post(url2, json).subscribe((pp) => {});
          const url3 = `${this.baseURL}/provider/${providerUuid}/attribute`;
          const json1 = {
            attributeType: "8d321915-e59d-4e19-98a9-086946bfc72b",
            value: font,
          };
          this.http.post(url3, json1).subscribe((ps) => {
            this.snackbar.open("Signature added successfully", null, {
              duration: 4000,
            });
          });
        }
        this.onClose();
      });
    } else if (this.data.type == "edit") {
      const url2 = this.data.name
        ? `${this.baseURLProvider}/${this.data.textOfSignuuid}`
        : this.baseURLProvider;

      const json = {
        attributeType: "c1c6458d-383b-4034-afa0-16a34185b458",
        value: text,
      };
      this.http.post(url2, json).subscribe((pp) => {});

      const url3 = this.data.font
        ? `${this.baseURLProvider}/${this.data.fontOfSignuuid}`
        : this.baseURLProvider;
      const json1 = {
        attributeType: "8d321915-e59d-4e19-98a9-086946bfc72b",
        value: font,
      };
      this.http.post(url3, json1).subscribe((ps) => {
        this.snackbar.open("Signature Updated successfully", null, {
          duration: 4000,
        });
        this.onClose();
      });
    }
  };
}
