class TransactionItem < ApplicationRecord
  # Associations
  belongs_to :parent_transaction, class_name: 'Transaction', foreign_key: 'transaction_id'
  belongs_to :product

  # Validations
  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :subtotal, presence: true, numericality: { greater_than_or_equal_to: 0 }

  # Callbacks
  before_validation :calculate_subtotal, if: -> { quantity.present? && unit_price.present? }

  private

  def calculate_subtotal
    self.subtotal = quantity * unit_price
  end
end