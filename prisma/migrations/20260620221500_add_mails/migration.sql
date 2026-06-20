-- CreateTable
CREATE TABLE "mails" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "client_id" TEXT,
    "from_name" VARCHAR(180) NOT NULL,
    "from_email" VARCHAR(180) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'a_traiter',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mails_recipient_id_status_idx" ON "mails"("recipient_id", "status");

-- AddForeignKey
ALTER TABLE "mails" ADD CONSTRAINT "mails_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mails" ADD CONSTRAINT "mails_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

