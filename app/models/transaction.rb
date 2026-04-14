class Transaction < ApplicationRecord
  # Associations
  belongs_to :user
  belongs_to :customer, optional: true
  has_many :transaction_items, foreign_key: 'transaction_id', dependent: :destroy
  has_many :payments, dependent: :destroy
  
  # Validations
  validates :invoice_number, presence: true, uniqueness: true
  validates :transaction_date, presence: true
  validates :subtotal, numericality: { greater_than_or_equal_to: 0 }
  validates :total_amount, numericality: { greater_than_or_equal_to: 0 }
  validates :status, inclusion: { in: %w[completed voided] }
  
  # Scopes
  scope :completed, -> { where(status: 'completed') }
  scope :voided, -> { where(status: 'voided') }
  scope :today, -> { where(transaction_date: Time.current.beginning_of_day..Time.current.end_of_day) }
  scope :this_week, -> { where(transaction_date: 1.week.ago..Time.current) }
  scope :this_month, -> { where(transaction_date: Time.current.beginning_of_month..Time.current.end_of_month) }
  
  # Callbacks
  before_validation :set_invoice_number, on: :create
  before_validation :set_transaction_date, on: :create
  
  # Instance methods
  def credit_sale?
    customer.present? && customer.total_debt > 0
  end
  
  def void!
    update(status: 'voided')
  end
  
  private
  
  def set_invoice_number
    return if invoice_number.present?
    # Format: INV-20260407-0001
    date_prefix = Time.current.strftime('%Y%m%d')
    last_transaction = Transaction.where("invoice_number LIKE ?", "INV-#{date_prefix}-%")
                                .order(:invoice_number)
                                .last
    
    if last_transaction
      last_number = last_transaction.invoice_number.split('-').last.to_i
      new_number = last_number + 1
    else
      new_number = 1
    end
    
    self.invoice_number = "INV-#{date_prefix}-#{new_number.to_s.rjust(4, '0')}"
  end
  
  def set_transaction_date
    self.transaction_date ||= Time.current
  end
end