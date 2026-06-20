-- AlterTable
ALTER TABLE "document_folders" ADD COLUMN     "fiscal_year" INTEGER,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_system_folder" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "month" INTEGER;

-- CreateIndex
CREATE INDEX "document_folders_client_id_fiscal_year_idx" ON "document_folders"("client_id", "fiscal_year");

