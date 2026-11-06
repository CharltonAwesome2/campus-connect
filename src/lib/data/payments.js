// src/lib/data/payments.js
import { supabase } from "../supabase";
import { safeNotify } from "./_helpers";

export const paymentsRepo = {
  async getPayments() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("payments")
      .select(`
        id, amount, due_date, paid_at, created_at, status, reference, application_id,
        description, gateway_provider, gateway_transaction_id, payment_method,
        applications (
          id,
          residences ( id, name, landlord_id, landlords ( company_name, email ) ),
          students ( id, user_id, profiles ( full_name, email ) )
        )
      `)
      .order("due_date", { ascending: false });
    if (error) throw error;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (data || []).map((p) => {
      let status = p.status;
      if (status === "pending" && p.due_date) {
        const due = new Date(p.due_date);
        due.setHours(0, 0, 0, 0);
        if (due < today) status = "overdue";
      }
      return {
        id: p.id,
        applicationId: p.application_id,
        amount: Number(p.amount),
        dueDate: p.due_date,
        paidAt: p.paid_at,
        createdAt: p.created_at,
        description: p.description,
        status,
        reference: p.reference,
        gatewayProvider: p.gateway_provider,
        gatewayTransactionId: p.gateway_transaction_id,
        paymentMethod: p.payment_method,
        residenceId: p.applications?.residences?.id,
        residenceName: p.applications?.residences?.name,
        landlordId: p.applications?.residences?.landlord_id,
        landlordCompany: p.applications?.residences?.landlords?.company_name,
        landlordEmail: p.applications?.residences?.landlords?.email,
        studentId: p.applications?.students?.id,
        studentUserId: p.applications?.students?.user_id,
        studentName: p.applications?.students?.profiles?.full_name,
        studentEmail: p.applications?.students?.profiles?.email,
      };
    });
  },

  async processPayment(paymentId, method = "eft") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in to pay.");

    const { data: payment, error: fetchErr } = await supabase
      .from("payments")
      .select("id, amount, reference, status, application_id")
      .eq("id", paymentId)
      .single();
    if (fetchErr) throw fetchErr;
    if (!payment) throw new Error("Payment not found");
    if (payment.status === "paid") throw new Error("This payment is already paid");
    if (payment.status === "cancelled") throw new Error("This payment was cancelled");

    const { chargePayment } = await import("@lib/payments/gateway");
    const result = await chargePayment({ amount: payment.amount, reference: payment.reference, method });
    if (!result.ok) throw new Error(result.error || "Payment failed");

    // Atomic: ownership check, status update, both notifications.
    const { error: rpcErr } = await supabase.rpc("student_pay_invoice", {
      p_payment_id: paymentId,
      p_provider: result.provider,
      p_transaction_id: result.transactionId,
      p_method: result.method,
    });
    if (rpcErr) {
      throw new Error(
        "Payment was charged by the gateway but could not be recorded. Contact support with your reference " +
          payment.reference + "."
      );
    }

    return this.getPayments();
  },

  async createPaymentRequest({ applicationId, amount, description, dueDate }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in.");

    const { error } = await supabase.from("payments").insert({
      application_id: applicationId,
      amount,
      description: description || "Monthly rent",
      due_date: dueDate,
      status: "pending",
      reference: `PAY-${Date.now()}`,
    });
    if (error) throw error;

    const { data: appRow } = await supabase
      .from("applications")
      .select("students ( user_id ), residences ( name )")
      .eq("id", applicationId)
      .single();

    if (appRow?.students?.user_id) {
      await safeNotify({
        user_id: appRow.students.user_id,
        title: "New payment request",
        body: `${appRow.residences?.name || "Your residence"}: R${Number(amount).toLocaleString()} due ${new Date(dueDate).toLocaleDateString()}.`,
        link: "/student",
      });
    }

    return this.getPayments();
  },
};