# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_07_092955) do
  create_table "categories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.boolean "its_active", default: true
    t.string "name"
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_categories_on_name", unique: true
  end

  create_table "customers", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.boolean "is_active", default: true
    t.string "name", null: false
    t.text "notes"
    t.string "phone"
    t.decimal "total_debt", precision: 10, scale: 2, default: "0.0"
    t.datetime "updated_at", null: false
    t.index ["is_active"], name: "index_customers_on_is_active"
    t.index ["name"], name: "index_customers_on_name"
    t.index ["phone"], name: "index_customers_on_phone"
  end

  create_table "payments", force: :cascade do |t|
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.string "payment_method", null: false
    t.string "reference_number"
    t.string "status", default: "completed"
    t.integer "transaction_id", null: false
    t.datetime "updated_at", null: false
    t.index ["payment_method"], name: "index_payments_on_payment_method"
    t.index ["reference_number"], name: "index_payments_on_reference_number"
    t.index ["status"], name: "index_payments_on_status"
    t.index ["transaction_id"], name: "index_payments_on_transaction_id"
  end

  create_table "products", force: :cascade do |t|
    t.string "barcode"
    t.integer "category_id"
    t.decimal "cost_price", precision: 10, scale: 2
    t.datetime "created_at", null: false
    t.text "description"
    t.boolean "is_active", default: true
    t.integer "minimum_stock", default: 0
    t.string "name", null: false
    t.decimal "price", precision: 10, scale: 2, null: false
    t.integer "quantity", default: 0
    t.string "sku"
    t.datetime "updated_at", null: false
    t.index ["barcode"], name: "index_products_on_barcode", unique: true
    t.index ["category_id"], name: "index_products_on_category_id"
    t.index ["name"], name: "index_products_on_name"
    t.index ["sku"], name: "index_products_on_sku", unique: true
  end

  create_table "transaction_items", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "product_id", null: false
    t.integer "quantity", default: 1, null: false
    t.decimal "subtotal", precision: 10, scale: 2, null: false
    t.integer "transaction_id", null: false
    t.decimal "unit_price", precision: 10, scale: 2, null: false
    t.datetime "updated_at", null: false
    t.index ["product_id"], name: "index_transaction_items_on_product_id"
    t.index ["transaction_id", "product_id"], name: "index_transaction_items_on_transaction_id_and_product_id"
    t.index ["transaction_id"], name: "index_transaction_items_on_transaction_id"
  end

  create_table "transactions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "customer_id"
    t.string "invoice_number", null: false
    t.text "notes"
    t.string "status", default: "completed"
    t.decimal "subtotal", precision: 10, scale: 2, default: "0.0"
    t.decimal "total_amount", precision: 10, scale: 2, default: "0.0"
    t.datetime "transaction_date", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["customer_id"], name: "index_transactions_on_customer_id"
    t.index ["invoice_number"], name: "index_transactions_on_invoice_number", unique: true
    t.index ["status"], name: "index_transactions_on_status"
    t.index ["transaction_date"], name: "index_transactions_on_transaction_date"
    t.index ["user_id"], name: "index_transactions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "current_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.datetime "last_sign_in_at"
    t.string "last_sign_in_ip"
    t.string "phone"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "role", default: "cashier", null: false
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["phone"], name: "index_users_on_phone", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role"], name: "index_users_on_role"
  end

  add_foreign_key "payments", "transactions"
  add_foreign_key "products", "categories"
  add_foreign_key "transaction_items", "products"
  add_foreign_key "transaction_items", "transactions"
  add_foreign_key "transactions", "customers"
  add_foreign_key "transactions", "users"
end
