import { useRef, useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  Loader2,
  PenLine,
  Upload,
  XCircle,
} from "lucide-react";
import type {
  BulkUploadResult,
  BulkUploadStudentRow,
} from "@/types/users";

const REQUIRED_HEADERS = ["name", "rollNo", "email", "hostel", "roomNo", "password", "mess"];
const ALL_HEADERS = [...REQUIRED_HEADERS];

type ValidationError = {
  row: number;
  field: string;
  message: string;
};

type DialogStep = "upload" | "preview" | "results";
type UploadMode = "create" | "upsert";

interface BulkUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (
    students: BulkUploadStudentRow[],
    mode: UploadMode
  ) => Promise<BulkUploadResult>;
  isLoading: boolean;
  emailDomain: string;
  wardenHostelName?: string;
}

function validateRow(
  row: Record<string, string>,
  index: number,
  emailDomain: string,
  wardenHostelName?: string
): { valid: BulkUploadStudentRow | null; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const rowNum = index + 1;

  if (!row.name || !/^[A-Za-z\s]+$/.test(row.name.trim())) {
    errors.push({
      row: rowNum,
      field: "name",
      message: "Name must contain only letters and spaces",
    });
  }

  if (!row.rollNo || !/^[0-9]{3}$/.test(row.rollNo.trim())) {
    errors.push({
      row: rowNum,
      field: "rollNo",
      message: "Roll number must be exactly 3 digits",
    });
  }

  if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
    errors.push({
      row: rowNum,
      field: "email",
      message: "Invalid email format",
    });
  } else if (emailDomain && !row.email.trim().toLowerCase().endsWith(emailDomain.toLowerCase())) {
    errors.push({
      row: rowNum,
      field: "email",
      message: `Email must belong to domain ${emailDomain}`,
    });
  }

  if (!row.hostel || row.hostel.trim() === "") {
    errors.push({
      row: rowNum,
      field: "hostel",
      message: "Hostel is required",
    });
  } else if (wardenHostelName && row.hostel.trim() !== wardenHostelName) {
    errors.push({
      row: rowNum,
      field: "hostel",
      message: `Wardens can only upload students to their assigned hostel (${wardenHostelName})`,
    });
  }

  if (!row.roomNo || row.roomNo.trim() === "") {
    errors.push({
      row: rowNum,
      field: "roomNo",
      message: "Room number is required",
    });
  }

  if (!row.password || row.password.trim().length < 6) {
    errors.push({
      row: rowNum,
      field: "password",
      message: "Password must be at least 6 characters",
    });
  }

  if (!row.mess || row.mess.trim() === "") {
    errors.push({
      row: rowNum,
      field: "mess",
      message: "Mess is required",
    });
  }

  if (errors.length > 0) return { valid: null, errors };

  return {
    valid: {
      name: row.name.trim(),
      rollNo: row.rollNo.trim(),
      email: row.email.trim().toLowerCase(),
      hostel: row.hostel.trim(),
      roomNo: row.roomNo.trim(),
      mess: row.mess.trim(),
      password: row.password.trim(),
    },
    errors: [],
  };
}

export function BulkUploadDialog({
  open,
  onClose,
  onUpload,
  isLoading,
  emailDomain,
  wardenHostelName,
}: BulkUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<DialogStep>("upload");
  const [parsedRows, setParsedRows] = useState<BulkUploadStudentRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [results, setResults] = useState<BulkUploadResult | null>(null);
  const [mode, setMode] = useState<UploadMode>("create");

  const resetState = () => {
    setStep("upload");
    setParsedRows([]);
    setValidationErrors([]);
    setHeaderError(null);
    setFileName(null);
    setResults(null);
    setMode("create");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setHeaderError("Please select a .csv file");
      return;
    }

    setFileName(file.name);
    setHeaderError(null);
    setValidationErrors([]);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        if (result.errors.length > 0) {
          setHeaderError(
            `CSV parsing error: ${result.errors[0].message} (row ${result.errors[0].row})`
          );
          return;
        }

        const headers = result.meta.fields || [];
        const missingHeaders = REQUIRED_HEADERS.filter(
          (h) => !headers.includes(h)
        );

        if (missingHeaders.length > 0) {
          setHeaderError(
            `Missing required columns: ${missingHeaders.join(", ")}. Required: ${REQUIRED_HEADERS.join(", ")}`
          );
          return;
        }

        const unknownHeaders = headers.filter(
          (h) => !ALL_HEADERS.includes(h)
        );
        if (unknownHeaders.length > 0) {
          setHeaderError(
            `Unknown columns: ${unknownHeaders.join(", ")}. Allowed: ${ALL_HEADERS.join(", ")}`
          );
          return;
        }

        if (result.data.length === 0) {
          setHeaderError("CSV file is empty (no data rows found)");
          return;
        }

        if (result.data.length > 200) {
          setHeaderError("Maximum 200 students per upload");
          return;
        }

        const allErrors: ValidationError[] = [];
        const validRows: BulkUploadStudentRow[] = [];

        result.data.forEach((row, i) => {
          const { valid, errors } = validateRow(row, i, emailDomain, wardenHostelName);
          if (valid) {
            validRows.push(valid);
          }
          allErrors.push(...errors);
        });

        const emailsSeen = new Map<string, number>();
        const rollNosSeen = new Map<string, number>();
        validRows.forEach((row, i) => {
          const rowNum = i + 1;
          if (emailsSeen.has(row.email)) {
            allErrors.push({
              row: rowNum,
              field: "email",
              message: `Duplicate email in CSV (same as row ${emailsSeen.get(row.email)})`,
            });
          } else {
            emailsSeen.set(row.email, rowNum);
          }
          if (rollNosSeen.has(row.rollNo)) {
            allErrors.push({
              row: rowNum,
              field: "rollNo",
              message: `Duplicate roll number in CSV (same as row ${rollNosSeen.get(row.rollNo)})`,
            });
          } else {
            rollNosSeen.set(row.rollNo, rowNum);
          }
        });

        setValidationErrors(allErrors);
        setParsedRows(validRows);
        setStep("preview");
      },
    });
  };

  const handleUpload = async () => {
    if (parsedRows.length === 0) return;
    try {
      const result = await onUpload(parsedRows, mode);
      setResults(result);
      setStep("results");
    } catch {
      // Error handled by parent
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Bulk Upload Students</SheetTitle>
          <SheetDescription>
            Upload a CSV file to create{" "}
            {wardenHostelName
              ? `students for ${wardenHostelName}`
              : "multiple student accounts"}
            .
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-4">
          {step === "upload" && (
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                <FileUp className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  Select a CSV file to upload
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Maximum 200 students per file
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose CSV File
                </Button>
                {fileName && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected: {fileName}
                  </p>
                )}
              </div>

              {headerError && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{headerError}</span>
                </div>
              )}

              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="text-sm font-medium">Required CSV format:</p>
                <code className="block text-xs bg-background rounded p-2 overflow-x-auto">
                  name,rollNo,email,hostel,roomNo,password,mess
                </code>
                <p className="text-xs text-muted-foreground">
                  All columns are required.
                </p>
                {emailDomain && (
                  <p className="text-xs text-muted-foreground">
                    All emails must use the{" "}
                    <code className="text-xs font-semibold">{emailDomain}</code>{" "}
                    domain.
                  </p>
                )}
                {wardenHostelName && (
                  <p className="text-xs text-muted-foreground">
                    All students must belong to{" "}
                    <code className="text-xs font-semibold">
                      {wardenHostelName}
                    </code>
                    .
                  </p>
                )}
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {parsedRows.length} valid student
                    {parsedRows.length !== 1 ? "s" : ""} found
                  </p>
                  {validationErrors.length > 0 && (
                    <p className="text-xs text-destructive">
                      {validationErrors.length} validation error
                      {validationErrors.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={resetState}>
                  Choose different file
                </Button>
              </div>

              {/* Mode toggle */}
              <div className="flex gap-2 rounded-lg border p-1">
                <Button
                  variant={mode === "create" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setMode("create")}
                >
                  Create Only
                </Button>
                <Button
                  variant={mode === "upsert" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setMode("upsert")}
                >
                  Create & Update
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {mode === "create"
                  ? "New students will be created. Existing emails will be skipped."
                  : "New students will be created. Existing emails will have their details updated (password unchanged)."}
              </p>

              {validationErrors.length > 0 && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 space-y-1 max-h-32 overflow-y-auto">
                  {validationErrors.map((err, i) => (
                    <p key={i} className="text-xs text-destructive">
                      Row {err.row}, {err.field}: {err.message}
                    </p>
                  ))}
                </div>
              )}

              {parsedRows.length > 0 && (
                <div className="rounded-md border max-h-80 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Hostel</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Mess</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedRows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-muted-foreground text-xs">
                            {i + 1}
                          </TableCell>
                          <TableCell className="text-sm">{row.name}</TableCell>
                          <TableCell className="text-sm">
                            {row.rollNo}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {row.email}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {row.hostel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {row.roomNo}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {row.mess}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {step === "results" && results && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-3 text-center">
                  <CheckCircle2 className="mx-auto h-5 w-5 text-green-600" />
                  <p className="mt-1 text-lg font-semibold text-green-700 dark:text-green-400">
                    {results.created.length}
                  </p>
                  <p className="text-xs text-green-600">Created</p>
                </div>
                <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-3 text-center">
                  <PenLine className="mx-auto h-5 w-5 text-blue-600" />
                  <p className="mt-1 text-lg font-semibold text-blue-700 dark:text-blue-400">
                    {results.updated.length}
                  </p>
                  <p className="text-xs text-blue-600">Updated</p>
                </div>
                <div className="rounded-lg border bg-yellow-50 dark:bg-yellow-950/20 p-3 text-center">
                  <AlertCircle className="mx-auto h-5 w-5 text-yellow-600" />
                  <p className="mt-1 text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                    {results.skipped.length}
                  </p>
                  <p className="text-xs text-yellow-600">Skipped</p>
                </div>
                <div className="rounded-lg border bg-red-50 dark:bg-red-950/20 p-3 text-center">
                  <XCircle className="mx-auto h-5 w-5 text-red-600" />
                  <p className="mt-1 text-lg font-semibold text-red-700 dark:text-red-400">
                    {results.errors.length}
                  </p>
                  <p className="text-xs text-red-600">Errors</p>
                </div>
              </div>

              {results.updated.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Updated:
                  </p>
                  <div className="rounded-lg border bg-blue-50/50 dark:bg-blue-950/10 p-2 max-h-28 overflow-y-auto space-y-1">
                    {results.updated.map((item, i) => (
                      <p
                        key={i}
                        className="text-xs text-blue-700 dark:text-blue-400"
                      >
                        Row {item.row}: {item.email} ({item.name})
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {results.skipped.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                    Skipped (duplicates):
                  </p>
                  <div className="rounded-lg border bg-yellow-50/50 dark:bg-yellow-950/10 p-2 max-h-28 overflow-y-auto space-y-1">
                    {results.skipped.map((item, i) => (
                      <p
                        key={i}
                        className="text-xs text-yellow-700 dark:text-yellow-400"
                      >
                        Row {item.row}: {item.email} - {item.reason}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {results.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">
                    Errors:
                  </p>
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2 max-h-28 overflow-y-auto space-y-1">
                    {results.errors.map((item, i) => (
                      <p key={i} className="text-xs text-destructive">
                        Row {item.row}: {item.email} - {item.reason}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="gap-2">
          {step === "upload" && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}

          {step === "preview" && (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isLoading || parsedRows.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload {parsedRows.length} Student
                    {parsedRows.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </>
          )}

          {step === "results" && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
