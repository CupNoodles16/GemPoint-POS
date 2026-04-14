class Product < ApplicationRecord
  # Association
  belongs_to :category, optional: true
  
  # Validations
  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :cost_price, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :quantity, numericality: { greater_than_or_equal_to: 0 }
  validates :minimum_stock, numericality: { greater_than_or_equal_to: 0 }
  
  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :in_stock, -> { where('quantity > 0') }
  scope :low_stock, -> { where('quantity <= minimum_stock') }
  
  # Instance methods
  def in_stock?
    quantity > 0
  end
  
  def low_stock?
    quantity <= minimum_stock
  end
end