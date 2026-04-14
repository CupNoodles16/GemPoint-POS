class Customer < ApplicationRecord
  # Associations
  has_many :transactions, dependent: :nullify
  
  # Validations
  validates :name, presence: true
  validates :total_debt, numericality: { greater_than_or_equal_to: 0 }
  
  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :with_debt, -> { where('total_debt > 0') }
  scope :no_debt, -> { where(total_debt: 0) }
  
  # Instance methods
  def has_debt?
    total_debt > 0
  end
  
  def add_debt(amount)
    update(total_debt: total_debt + amount)
  end
  
  def pay_debt(amount)
    new_debt = total_debt - amount
    update(total_debt: new_debt >= 0 ? new_debt : 0)
  end
  
  def to_s
    "#{name} (#{has_debt? ? "Owes ₱#{total_debt}" : "No debt"})"
  end
end