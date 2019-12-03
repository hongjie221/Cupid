defmodule Cupid.Users do
  @moduledoc """
  The Users context.
  """

  import Ecto.Query, warn: false
  alias Cupid.Repo

  alias Cupid.Users.User

  @doc """
  Returns the list of users.

  ## Examples

      iex> list_users()
      [%User{}, ...]

  """
  def list_users do
    Repo.all(User)
  end

  @doc """
  Gets a single user.

  Raises `Ecto.NoResultsError` if the User does not exist.

  ## Examples

      iex> get_user!(123)
      %User{}

      iex> get_user!(456)
      ** (Ecto.NoResultsError)

  """
  def get_user!(id), do: Repo.get!(User, id)

  @doc """
  """
  def authenticate_user(email, password) do
    user = Repo.get_by(User, email: email)

    case Argon2.check_pass(user, password) do
      {:ok, user} -> user
      _else -> nil
    end
  end

  @doc """
  Creates a user.

  ## Examples

      iex> create_user(%{field: value})
      {:ok, %User{}}

      iex> create_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_user(attrs \\ %{}) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a user.

  ## Examples

      iex> update_user(user, %{field: new_value})
      {:ok, %User{}}

      iex> update_user(user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_user(%User{} = user, attrs) do
    user
    |> User.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a User.

  ## Examples

      iex> delete_user(user)
      {:ok, %User{}}

      iex> delete_user(user)
      {:error, %Ecto.Changeset{}}

  """
  def delete_user(%User{} = user) do
    Repo.delete(user)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking user changes.

  ## Examples

      iex> change_user(user)
      %Ecto.Changeset{source: %User{}}

  """
  def change_user(%User{} = user) do
    User.changeset(user, %{})
  end

  def update_user_desc_by_id(id, desc) do
    Repo.get_by(User, id: id)
    |> Ecto.Changeset.change(%{desc: desc})
    |> Repo.update()
  end

  def update_user_lan_lon_by_id(id, lan, lon, addr) do
    pi = 3.14159265
    lan = pi * lan / 180
    lon = pi * lon / 180

    Repo.get_by(User, id: id)
    |> Ecto.Changeset.change(%{lan: lan, lon: lon, addr: addr})
    |> Repo.update()
  end

  def get_user_by_radius(id) do
    curr_user = Repo.get_by(User, id: id)

    curr_lan = Decimal.to_float(curr_user.lan)
    curr_lon = Decimal.to_float(curr_user.lon)

    km_radius = 6373

    list_users()
    |> Enum.filter(fn x -> x.lan !== 0 and x.lon !== 0 and x.id !== id end)
    |> Enum.map(fn x ->
      one_lan = Decimal.to_float(x.lan)
      one_lon = Decimal.to_float(x.lon)
      sin_lan = :math.sin(curr_lan) * :math.sin(one_lan)
      cos_val = :math.cos(curr_lan) * :math.cos(one_lan)
      cos_val = cos_val * :math.cos(curr_lon - one_lon)
      sum_up = sin_lan + cos_val
      # the following statement is to avoid the floating point operation rounding error
      sum_up =
        if sum_up > 1.0 do
          1.0
        else
          if sum_up < -1.0 do
            -1.0
          else
            sum_up
          end
        end

      dist = :math.acos(sum_up) * km_radius
      Map.put(x, :distance, dist)
    end)
    # return all the ppl within 5km distance
    |> Enum.filter(fn x -> x.distance < 5 end)
    |> Enum.map(fn x -> x.id end)
  end
end
