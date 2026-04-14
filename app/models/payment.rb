class Payment < ApplicationRecord
  # Associations - using 'sale' instead of 'transaction' to avoid conflict
  belongs_to :sale, class_name: 'Transaction', foreign_key: 'transaction_id'
  
  # Validations
  validates :payment_method, presence: true, inclusion: { in: %w[cash gcash paymaya] }
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :reference_number, presence: true, if: -> { payment_method.in?(%w[gcash paymaya]) }
  validates :status, inclusion: { in: %w[completed pending failed] }
  
  # Scopes
  scope :cash, -> { where(payment_method: 'cash') }
  scope :gcash, -> { where(payment_method: 'gcash') }
  scope :paymaya, -> { where(payment_method: 'paymaya') }
  scope :completed, -> { where(status: 'completed') }
  
  # Instance methods
  def digital_payment?
    payment_method.in?(%w[gcash paymaya])
  end
  
  def to_s
    "#{payment_method.upcase}: ₱#{amount}"
  end
end